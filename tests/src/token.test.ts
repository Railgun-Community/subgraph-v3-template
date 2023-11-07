import { assert, describe, test } from 'matchstick-as/assembly/index';
import { Bytes, BigInt } from '@graphprotocol/graph-ts';
import { getTokenHash, getTokenTypeEnum } from '../../src/token';

describe('token', () => {
  test('Should get token hashes for all token types', () => {
    const tokenAddress = Bytes.fromHexString(
      '0x1234567890123456789012345678901234567890',
    );
    const tokenSubID = BigInt.fromString('1');

    // ERC20
    assert.bytesEquals(
      getTokenHash(0, tokenAddress, tokenSubID),
      Bytes.fromHexString(
        '0x0000000000000000000000001234567890123456789012345678901234567890',
      ),
    );

    // ERC721
    assert.bytesEquals(
      getTokenHash(1, tokenAddress, tokenSubID),
      Bytes.fromHexString(
        '075b737079de804169d5e006add4da4942063ab4fce32268c469c49460e52be0',
      ),
    );

    // ERC1155
    assert.bytesEquals(
      getTokenHash(2, tokenAddress, tokenSubID),
      Bytes.fromHexString(
        '2d0c48e5b759b13bea21d65719c47747f857f47be541ddb0df54fa0a040a7bed',
      ),
    );
  });

  test('Should get token enums for all token types', () => {
    assert.stringEquals(getTokenTypeEnum(0), 'ERC20');
    assert.stringEquals(getTokenTypeEnum(1), 'ERC721');
    assert.stringEquals(getTokenTypeEnum(2), 'ERC1155');
  });
});
