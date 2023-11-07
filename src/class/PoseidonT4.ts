// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import { ethereum, Bytes, Address, BigInt } from '@graphprotocol/graph-ts';

export class PoseidonT4 extends ethereum.SmartContract {
  static bind(address: Address): PoseidonT4 {
    return new PoseidonT4('PoseidonT4', address);
  }

  poseidon(input: Array<Bytes>): Bytes {
    let result = super.call('poseidon', 'poseidon(bytes32[3]):(bytes32)', [
      ethereum.Value.fromFixedSizedArray(
        input.map<ethereum.Value>((i: Bytes) => ethereum.Value.fromBytes(i)),
      ),
    ]);

    return result[0].toBytes();
  }

  try_poseidon(input: Array<Bytes>): ethereum.CallResult<Bytes> {
    let result = super.tryCall('poseidon', 'poseidon(bytes32[3]):(bytes32)', [
      ethereum.Value.fromFixedSizedArray(
        input.map<ethereum.Value>((i: Bytes) => ethereum.Value.fromBytes(i)),
      ),
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  poseidon1(input: Array<BigInt>): BigInt {
    let result = super.call('poseidon', 'poseidon(uint256[3]):(uint256)', [
      ethereum.Value.fromFixedSizedArray(
        input.map<ethereum.Value>((i: BigInt) =>
          ethereum.Value.fromUnsignedBigInt(i),
        ),
      ),
    ]);

    return result[0].toBigInt();
  }

  try_poseidon1(input: Array<BigInt>): ethereum.CallResult<BigInt> {
    let result = super.tryCall('poseidon', 'poseidon(uint256[3]):(uint256)', [
      ethereum.Value.fromFixedSizedArray(
        input.map<ethereum.Value>((i: BigInt) =>
          ethereum.Value.fromUnsignedBigInt(i),
        ),
      ),
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}