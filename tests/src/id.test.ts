import {
  assert,
  describe,
  test,
  newMockEvent,
} from 'matchstick-as/assembly/index';
import { BigInt, Bytes, log } from '@graphprotocol/graph-ts';
import { idFrom2PaddedBigInts, idFromEventLogIndex } from '../../src/id';

describe('id', () => {
  test('Should create ID from 2 padded bigints', () => {
    assert.bytesEquals(
      idFrom2PaddedBigInts(BigInt.fromString('2'), BigInt.fromString('3')),
      Bytes.fromHexString(
        '0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003',
      ),
    );
  });

  test('Should create separate IDs for full merkletree', () => {
    const ids: Bytes[] = [];

    const startPosition = BigInt.fromString('2');

    for (let i = -2; i < 400; i++) {
      const bytes = idFrom2PaddedBigInts(
        BigInt.fromString('0'),
        startPosition.plus(BigInt.fromString(i.toString())),
      );

      // Not equal to any previous ID
      for (let j = 0; j < ids.length; j++) {
        assert.assertTrue(bytes.toHexString() !== ids[j].toHexString());
      }

      // log.debug('bytes: {}', [bytes.toHexString()]);
      ids.push(bytes);
    }
  });

  test('Should create ID from event log index', () => {
    assert.bytesEquals(
      idFromEventLogIndex(newMockEvent()),
      Bytes.fromHexString('0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000'),
    );

    const event = newMockEvent();
    event.transaction.hash = Bytes.fromHexString('0x01');
    event.logIndex = BigInt.fromString('2');

    assert.bytesEquals(
      idFromEventLogIndex(event),
      Bytes.fromHexString('0x0102000000'), // Note: logIndex is little-endian.
    );
  });
});
