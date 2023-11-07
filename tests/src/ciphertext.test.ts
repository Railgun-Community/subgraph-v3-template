import { assert, describe, test } from 'matchstick-as/assembly/index';
import { Bytes } from '@graphprotocol/graph-ts';
import {
  getCiphertextData,
  getCiphertextIV,
  getCiphertextTag,
} from '../../src/ciphertext';

describe('ciphertext', () => {
  test('Should create chunked ciphertext fields from ciphertext Bytes array', () => {
    const ciphertext: Bytes[] = [
      Bytes.fromHexString(
        '0x112233445566778899aabbccddeeff0123456789abcdeffedcba9876543210', // 31 bytes to test leading 00
      ),
      Bytes.fromHexString(
        '0x112233445566778899aabbccddeeff0123456789abcdeffedcba9876543210', // 31 bytes to test leading 00
      ),
      Bytes.fromHexString('0x694200'),
    ];

    const iv = getCiphertextIV(ciphertext);
    const tag = getCiphertextTag(ciphertext);

    assert.stringEquals(iv.toHexString(), '0x00112233445566778899aabbccddeeff'); // has leading 00
    assert.stringEquals(
      tag.toHexString(),
      '0x0123456789abcdeffedcba9876543210',
    );

    const data = getCiphertextData(ciphertext);

    assert.stringEquals(
      data[0].toHexString(),
      '0x00112233445566778899aabbccddeeff0123456789abcdeffedcba9876543210',
    );
    assert.stringEquals(
      data[1].toHexString(),
      '0x0000000000000000000000000000000000000000000000000000000000694200',
    );
  });
});
