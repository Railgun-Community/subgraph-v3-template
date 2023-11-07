import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  AccumulatorStateUpdateUpdateShieldsStruct,
  AccumulatorStateUpdateUpdateTransactionsStruct,
  AccumulatorStateUpdateUpdateTreasuryFeesStruct,
} from '../generated/PoseidonMerkleAccumulator/PoseidonMerkleAccumulator';
import { getTokenHash } from './token';
import { strip0x } from './utils';

export type TreasuryFeeMap = Map<string, BigInt[]>;

export function getTreasuryFeeMap(
  transactions: AccumulatorStateUpdateUpdateTransactionsStruct[],
  shields: AccumulatorStateUpdateUpdateShieldsStruct[],
  treasuryFees: AccumulatorStateUpdateUpdateTreasuryFeesStruct[],
): TreasuryFeeMap {
  const treasuryFeeMap: Map<string, BigInt[]> = new Map();

  for (let i = 0; i < treasuryFees.length; i += 1) {
    const tokenID = treasuryFees[i].tokenID;
    const fee = treasuryFees[i].fee;

    let unshieldValue = BigInt.zero();
    for (let j = 0; j < transactions.length; j += 1) {
      const unshieldTokenHash = getTokenHash(
        transactions[j].unshieldPreimage.token.tokenType,
        transactions[j].unshieldPreimage.token.tokenAddress,
        transactions[j].unshieldPreimage.token.tokenSubID,
      );
      if (unshieldTokenHash.equals(tokenID)) {
        unshieldValue = unshieldValue.plus(
          transactions[j].unshieldPreimage.value,
        );
      }
    }

    let shieldValue = BigInt.zero();
    for (let j = 0; j < shields.length; j += 1) {
      const shieldTokenHash = getTokenHash(
        shields[j].preimage.token.tokenType,
        shields[j].preimage.token.tokenAddress,
        shields[j].preimage.token.tokenSubID,
      );
      if (shieldTokenHash.equals(tokenID)) {
        shieldValue = shieldValue.plus(shields[j].preimage.value);
      }
    }

    let shieldFeePortion = BigInt.zero();
    let unshieldFeePortion = BigInt.zero();

    const totalValue = unshieldValue.plus(shieldValue);

    // TODO: This calculation assumes that the shield and unshield fees are equal.
    if (unshieldValue < shieldValue) {
      unshieldFeePortion = unshieldValue.times(fee).div(totalValue);
      shieldFeePortion = fee.minus(unshieldFeePortion);
    } else {
      shieldFeePortion = shieldValue.times(fee).div(totalValue);
      unshieldFeePortion = fee.minus(shieldFeePortion);
    }

    const tokenIDString = tokenID.toHexString();
    treasuryFeeMap.set(tokenIDString, [shieldFeePortion, unshieldFeePortion]);
  }

  return treasuryFeeMap;
}
