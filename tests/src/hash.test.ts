import { assert, describe, test } from 'matchstick-as/assembly';
import { BigInt, Bytes, log } from '@graphprotocol/graph-ts';
import { getNoteHash } from '../../src/hash';
import { createMockPoseidonT4Call } from '../util/mock-calls.test';
import { reversedBytesToBigInt } from '../../src/utils';

describe('hash', () => {
  test('Should create note hash for live shield commitment', () => {
    // NOTE: This mock is used in the test, so the hash is not computed.
    // This test therefore only really tests the type conversions.
    createMockPoseidonT4Call(
      reversedBytesToBigInt(
        Bytes.fromHexString(
          '0x12a1f22c8e1f7feb6923ac7118fc66aaa19ebbb1abbbba9b8a271d06b2277abd', // npk
        ),
      ),
      reversedBytesToBigInt(
        Bytes.fromHexString(
          '0x000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7', // token hash
        ),
      ),
      reversedBytesToBigInt(
        Bytes.fromHexString(
          '0x0000000000000000000000001b70cc71', // value
        ),
      ),
      reversedBytesToBigInt(
        Bytes.fromHexString(
          '0x04300939ad6f444712784a719c6d0bbe1b49a0b4d16983a6324bbbac136a83c7', // hash
        ),
      ),
    );

    assert.stringEquals(
      getNoteHash(
        reversedBytesToBigInt(
          Bytes.fromHexString(
            '0x12a1f22c8e1f7feb6923ac7118fc66aaa19ebbb1abbbba9b8a271d06b2277abd', // npk
          ),
        ),
        reversedBytesToBigInt(
          Bytes.fromHexString(
            '0x000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7', // token hash
          ),
        ),
        reversedBytesToBigInt(
          Bytes.fromHexString(
            '0x0000000000000000000000001b70cc71', // value
          ),
        ),
      ).toString(),
      reversedBytesToBigInt(
        Bytes.fromHexString(
          '0x04300939ad6f444712784a719c6d0bbe1b49a0b4d16983a6324bbbac136a83c7', // hash
        ),
      ).toString(),
    );
  });
});
