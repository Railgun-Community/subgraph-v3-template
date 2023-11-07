import { assert, describe, test } from 'matchstick-as/assembly/index';
import { CHAIN_ID } from '../../src/chain-id';

describe('chain-id', () => {
  test('Should have ID 1 (Ethereum) as default test CHAIN_ID', () => {
    assert.i32Equals(CHAIN_ID, 1);
  });
});
