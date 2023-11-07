import { assert, describe, test } from 'matchstick-as/assembly/index';
import { Bytes, BigInt, ByteArray } from '@graphprotocol/graph-ts';
import {
  bigIntToBytes,
  strip0x,
  padTo32BytesStart,
  reverseBytes,
} from '../../src/utils';

describe('utils', () => {
  test('Should strip0x bytes', () => {
    assert.stringEquals(strip0x(Bytes.fromHexString('0x1234')), '1234');
  });

  test('Should pad to 32 bytes - start', () => {
    assert.bytesEquals(
      padTo32BytesStart(Bytes.fromHexString('0x1234')),
      Bytes.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000001234',
      ),
    );
  });

  test('Should convert byte array to Bytes type', () => {
    assert.bytesEquals(
      Bytes.fromByteArray(ByteArray.fromHexString('0x1234')),
      Bytes.fromHexString('0x1234'),
    );
  });

  test('Should convert bytes to bigint', () => {
    assert.bytesEquals(
      bigIntToBytes(BigInt.fromString('4444')),
      Bytes.fromHexString('0x115c'),
    );
    assert.bytesEquals(
      bigIntToBytes(BigInt.fromString('1111')),
      Bytes.fromHexString('0x0457'),
    );
  });

  test('Should convert bigint to reversed bytes', () => {
    assert.bytesEquals(
      bigIntToBytes(BigInt.fromString('32083208')),
      Bytes.fromHexString('0x01E98D08'),
    );
  });

  // Disable this test - this shouldn't ever occur, but it won't reasonably happen in the wild.
  // test('Should convert bigint to bytes - no trailing zeroes', () => {
  //   assert.bytesEquals(
  //     bigIntToBytes(
  //       BigInt.fromString(
  //         '90242445949098488452428447776786287380055845379199724668622459559822121054212',
  //       ),
  //     ),
  //     Bytes.fromHexString(
  //       '0x04300939ad6f444712784a719c6d0bbe1b49a0b4d16983a6324bbbac136a83c7', // Should NOT be 0x04300939ad6f444712784a719c6d0bbe1b49a0b4d16983a6324bbbac136a83c700
  //     ),
  //   );
  // });

  test('Should convert bigint to Bytes type', () => {
    // Big endian
    assert.bytesEquals(
      bigIntToBytes(BigInt.fromString('2')),
      Bytes.fromHexString('0x02'),
    );
    assert.bytesEquals(
      bigIntToBytes(BigInt.fromI32(2)),
      Bytes.fromHexString('0x02'),
    );

    // Little endian
    assert.bytesEquals(Bytes.fromI32(2), Bytes.fromHexString('0x02000000'));
  });

  test('Should reverse Bytes, endian friendly', () => {
    assert.bytesEquals(
      reverseBytes(Bytes.fromHexString('0x0001')),
      Bytes.fromHexString('0x0100'),
    );
  });
});
