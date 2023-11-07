import { Bytes, BigInt } from '@graphprotocol/graph-ts';
import {
  AccumulatorStateUpdate as AccumulatorStateUpdateEvent,
  AccumulatorStateUpdateUpdateCommitmentCiphertextStruct,
  AccumulatorStateUpdateUpdateShieldsStruct,
  AccumulatorStateUpdateUpdateTransactionsStruct,
} from '../generated/PoseidonMerkleAccumulator/PoseidonMerkleAccumulator';
import { reversedBytesToBigInt } from './utils';
import {
  saveCommitmentCiphertext,
  saveCommitmentPreimage,
  saveNullifier,
  saveShieldCommitment,
  saveToken,
  saveTransactCommitment,
  saveUnshield,
} from './entity';
import { idFrom2PaddedBigInts, idFrom3PaddedBigInts } from './id';
import {
  getNoteHash,
  getRailgunTransactionID,
  getUnshieldPreImageNoteHash,
} from './hash';
import { getTokenHash } from './token';
import { TreasuryFeeMap, getTreasuryFeeMap } from './treasury-fee-map';
import { CommitmentCiphertext } from '../generated/schema';

const TREE_MAX_ITEMS = BigInt.fromString('65536');

export function handleAccumulatorStateUpdate(
  event: AccumulatorStateUpdateEvent,
): void {
  const update = event.params.update;
  const accumulatorNumber = event.params.accumulatorNumber;
  const startPosition = event.params.startPosition;

  const commitments = update.commitments;
  const transactions = update.transactions;
  const shields = update.shields;
  const commitmentCiphertext = update.commitmentCiphertext;
  const treasuryFees = update.treasuryFees;
  const senderCiphertext = update.senderCiphertext;

  const treasuryFeeMap = getTreasuryFeeMap(transactions, shields, treasuryFees);

  let utxoTree = accumulatorNumber;
  let utxoStartPosition = startPosition;

  const { newUTXOTree, newUTXOStartPosition } = handleTransactions(
    event,
    commitments,
    transactions,
    commitmentCiphertext,
    treasuryFeeMap,
    utxoTree,
    utxoStartPosition,
  );

  handleShields(
    event,
    shields,
    treasuryFeeMap,
    newUTXOTree,
    newUTXOStartPosition,
  );
}

function handleTransactions(
  event: AccumulatorStateUpdateEvent,
  commitments: Bytes[],
  transactions: AccumulatorStateUpdateUpdateTransactionsStruct[],
  commitmentCiphertext: AccumulatorStateUpdateUpdateCommitmentCiphertextStruct[],
  treasuryFeeMap: TreasuryFeeMap,
  utxoTree: BigInt,
  utxoStartPosition: BigInt,
): { newUTXOTree: BigInt; newUTXOStartPosition: BigInt } {
  let commitmentsStartIndex = 0;

  for (let i = 0; i < transactions.length; i += 1) {
    const transaction = transactions[i];

    const nullifiers = transaction.nullifiers;
    const commitmentsCount = transaction.commitmentsCount;
    const spendAccumulatorNumber = transaction.spendAccumulatorNumber;
    const unshieldPreimage = transaction.unshieldPreimage;
    const boundParamsHash = transaction.boundParamsHash;

    const commitmentsEndIndex = commitmentsStartIndex + commitmentsCount;
    const commitmentHashes = commitments.slice(
      commitmentsStartIndex,
      commitmentsEndIndex,
    );
    const commitmentCiphertexts = commitmentCiphertext.slice(
      commitmentsStartIndex,
      commitmentsEndIndex,
    );
    if (commitmentHashes.length !== commitmentsCount) {
      throw new Error(
        'Expected commitmentHashes length to match commitmentsCount',
      );
    }
    if (commitmentCiphertexts.length !== commitmentsCount) {
      throw new Error(
        'Expected commitmentCiphertexts length to match commitmentsCount',
      );
    }
    commitmentsStartIndex = commitmentsEndIndex;

    const hasUnshield = !unshieldPreimage.value.equals(BigInt.zero());
    const railgunTxid = getRailgunTransactionID(
      nullifiers,
      commitmentHashes,
      boundParamsHash,
      hasUnshield ? getUnshieldPreImageNoteHash(unshieldPreimage) : null,
    );

    // TODO: Save RailgunTransaction
    // TODO: Handle case where only-unshield
    // const railgunTransaction = saveRailgunTransaction(
    //   event.transaction.hash,
    //   event.block.number,
    //   event.block.timestamp,
    //   commitmentsWithUnshieldHash,
    //   nullifiers,
    //   unshieldPreimage,
    //   boundParamsHash,
    //   Number(spendAccumulatorNumber), // utxoTreeIn
    //   utxoTree,
    //   utxoStartPosition,
    // );

    const transactEventID = idFrom2PaddedBigInts(utxoTree, utxoStartPosition);

    let transactCommitmentCiphertexts: CommitmentCiphertext[] = [];
    for (let j = 0; j < commitmentCiphertexts.length; j += 1) {
      const commitmentCiphertextID = idFrom2PaddedBigInts(
        utxoTree,
        utxoStartPosition.plus(BigInt.fromString(j.toString())),
      );
      transactCommitmentCiphertexts.push(
        saveCommitmentCiphertext(
          commitmentCiphertextID,
          commitmentCiphertexts[j].ciphertext,
          commitmentCiphertexts[j].blindedSenderViewingKey,
          commitmentCiphertexts[j].blindedReceiverViewingKey,
        ),
      );
    }

    saveTransactCommitment(
      transactEventID,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      utxoTree,
      utxoStartPosition,
      commitmentHashes,
      transactCommitmentCiphertexts,
    );

    for (let j = 0; j < nullifiers.length; j += 1) {
      const nullifier = nullifiers[j];
      const nullifierID = idFrom2PaddedBigInts(
        spendAccumulatorNumber,
        reversedBytesToBigInt(nullifier),
      );
      saveNullifier(
        nullifierID,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash,
        spendAccumulatorNumber,
        nullifier,
      );
    }

    if (hasUnshield) {
      const totalUnshieldValuesForToken = transactions.reduce((acc, curr) => {
        return acc.plus(curr.unshieldPreimage.value);
      }, BigInt.zero());
      const unshieldTokenHashString = getTokenHash(
        unshieldPreimage.token.tokenType,
        unshieldPreimage.token.tokenAddress,
        unshieldPreimage.token.tokenSubID,
      ).toHexString();
      const isERC20 = unshieldPreimage.token.tokenType === 0;
      if (isERC20 && !treasuryFeeMap.has(unshieldTokenHashString)) {
        throw new Error('Expected unshield token hash in treasuryFeeMap');
      }
      const unshieldFee = totalUnshieldValuesForToken.gt(BigInt.zero())
        ? treasuryFeeMap
            .get(unshieldTokenHashString)[1]
            .times(unshieldPreimage.value)
            .div(totalUnshieldValuesForToken)
        : BigInt.zero();

      const transactCommitmentBatchIndex = BigInt.fromString(i.toString());

      const unshieldID = idFrom3PaddedBigInts(
        event.block.number,
        event.logIndex,
        transactCommitmentBatchIndex,
      );

      const token = saveToken(
        unshieldPreimage.token.tokenType,
        unshieldPreimage.token.tokenAddress,
        unshieldPreimage.token.tokenSubID,
      );

      saveUnshield(
        unshieldID,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash,
        railgunTxid,
        unshieldPreimage.npk,
        token,
        unshieldPreimage.value,
        unshieldFee,
        transactCommitmentBatchIndex,
      );
    }

    utxoStartPosition = utxoStartPosition.plus(
      BigInt.fromString(commitmentsCount.toString()),
    );
    if (utxoStartPosition >= TREE_MAX_ITEMS) {
      utxoStartPosition = BigInt.zero();
      utxoTree = utxoTree.plus(BigInt.fromString('1'));
    }
  }

  return { newUTXOTree: utxoTree, newUTXOStartPosition: utxoStartPosition };
}

function handleShields(
  event: AccumulatorStateUpdateEvent,
  shields: AccumulatorStateUpdateUpdateShieldsStruct[],
  treasuryFeeMap: TreasuryFeeMap,
  utxoTree: BigInt,
  utxoStartPosition: BigInt,
): void {
  for (let i = 0; i < shields.length; i += 1) {
    const shield = shields[i];

    const totalShieldValuesForToken = shields.reduce((acc, curr) => {
      return acc.plus(curr.preimage.value);
    }, BigInt.zero());

    const preimage = shield.preimage;
    const shieldTokenHash = getTokenHash(
      preimage.token.tokenType,
      preimage.token.tokenAddress,
      preimage.token.tokenSubID,
    );
    const shieldTokenHashString = shieldTokenHash.toHexString();
    const isERC20 = preimage.token.tokenType === 0;
    if (isERC20 && !treasuryFeeMap.has(shieldTokenHashString)) {
      throw new Error('Expected shield token hash in treasuryFeeMap');
    }
    // Assume equal shield fees across each shield for this token.
    const shieldFee = totalShieldValuesForToken.gt(BigInt.zero())
      ? treasuryFeeMap
          .get(shieldTokenHashString)[1]
          .times(preimage.value)
          .div(totalShieldValuesForToken)
      : BigInt.zero();

    const commitmentHash = getNoteHash(
      reversedBytesToBigInt(preimage.npk),
      reversedBytesToBigInt(shieldTokenHash),
      preimage.value,
    );

    const shieldID = idFrom2PaddedBigInts(utxoTree, utxoStartPosition);

    const token = saveToken(
      preimage.token.tokenType,
      preimage.token.tokenAddress,
      preimage.token.tokenSubID,
    );

    const commitmentPreimage = saveCommitmentPreimage(
      shieldID,
      preimage.npk,
      token,
      preimage.value,
    );

    saveShieldCommitment(
      shieldID,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      utxoTree,
      utxoStartPosition,
      shield.from,
      Bytes.fromBigInt(commitmentHash),
      commitmentPreimage,
      shield.ciphertext.encryptedBundle,
      shield.ciphertext.shieldKey,
      shieldFee,
    );

    utxoStartPosition = utxoStartPosition.plus(BigInt.fromString('1'));
    if (utxoStartPosition >= TREE_MAX_ITEMS) {
      utxoStartPosition = BigInt.zero();
      utxoTree = utxoTree.plus(BigInt.fromString('1'));
    }
  }
}
