import { assert, describe, test } from 'matchstick-as/assembly/index';
import { BigInt } from '@graphprotocol/graph-ts';
import { getTreasuryFeeMap } from '../../src/treasury-fee-map';
import { createAccumulatorStateUpdateEvent } from '../util/event-utils.test';

describe('treasury-fee-map', () => {
  test('Should extract treasury fee map', () => {
    const event = createAccumulatorStateUpdateEvent();

    const treasuryFeeMap = getTreasuryFeeMap(
      event.params.update.transactions,
      event.params.update.shields,
      event.params.update.treasuryFees,
    );

    assert.booleanEquals(treasuryFeeMap.has('00'), false);

    const tokenID =
      '0x0000000000000000000000001111111122222222333333334444444455555555';
    assert.stringEquals(
      event.params.update.treasuryFees[0].tokenID.toHexString(),
      tokenID,
    );
    assert.booleanEquals(treasuryFeeMap.has(tokenID), true);

    const shieldFee = treasuryFeeMap[tokenID][0];
    assert.bigIntEquals(shieldFee, BigInt.fromString('1666667'));

    const unshieldFee = treasuryFeeMap[tokenID][1];
    assert.bigIntEquals(unshieldFee, BigInt.fromString('833333'));
  });
});
