import { ethereum, BigInt } from '@graphprotocol/graph-ts';
import { assert, log } from 'matchstick-as';
import { getTokenTypeEnum } from '../../src/token';
import { bigIntToBytes, padHexStringToEven } from '../../src/utils';

export const assertCommonFields = (
  entityType: string,
  id: string,
  event: ethereum.Event,
): void => {
  assert.fieldEquals(
    entityType,
    id,
    'blockNumber',
    event.block.number.toString(),
  );

  assert.fieldEquals(
    entityType,
    id,
    'blockTimestamp',
    event.block.timestamp.toString(),
  );

  assert.fieldEquals(
    entityType,
    id,
    'transactionHash',
    event.transaction.hash.toHexString(),
  );
};

export const assertCommonCommitmentFields = (
  entityType: string,
  id: string,
  event: ethereum.Event,
  treeNumber: BigInt,
  startPosition: BigInt,
  i: BigInt,
  hash: BigInt,
): void => {
  assertCommonFields(entityType, id, event);

  assert.fieldEquals(entityType, id, 'treeNumber', treeNumber.toString());

  assert.fieldEquals(
    entityType,
    id,
    'batchStartTreePosition',
    startPosition.toString(),
  );

  assert.fieldEquals(
    entityType,
    id,
    'treePosition',
    startPosition.plus(i).toString(),
  );

  assert.fieldEquals(entityType, id, 'hash', hash.toString());
};

export const assertTokenFields = (id: string, tuple: ethereum.Tuple): void => {
  const tokenType = tuple[0].toI32();
  const tokenAddress = tuple[1].toAddress();
  const tokenSubID = tuple[2].toBigInt();

  log.debug('{}', [bigIntToBytes(tokenSubID).toHexString()]);

  assert.fieldEquals('Token', id, 'tokenType', getTokenTypeEnum(tokenType));
  assert.fieldEquals('Token', id, 'tokenAddress', tokenAddress.toHexString());
  assert.fieldEquals(
    'Token',
    id,
    'tokenSubID',
    bigIntToBytes(tokenSubID).toHexString(),
  );
};
