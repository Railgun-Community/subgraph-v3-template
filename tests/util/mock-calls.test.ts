import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { createMockedFunction, log } from 'matchstick-as';
import { getPoseidonT4ContractAddress } from '../../src/contracts';

export const createMockPoseidonT4Call = (
  input1: BigInt,
  input2: BigInt,
  input3: BigInt,
  result: BigInt,
): void => {
  const contractAddress = Address.fromString(getPoseidonT4ContractAddress());

  // log.debug('inputs: {} {} {}', [
  //   input1.toString(),
  //   input2.toString(),
  //   input3.toString(),
  // ]);

  createMockedFunction(
    contractAddress,
    'poseidon',
    'poseidon(uint256[3]):(uint256)',
  )
    .withArgs([
      ethereum.Value.fromFixedSizedArray([
        ethereum.Value.fromUnsignedBigInt(input1),
        ethereum.Value.fromUnsignedBigInt(input2),
        ethereum.Value.fromUnsignedBigInt(input3),
      ]),
    ])
    .returns([ethereum.Value.fromUnsignedBigInt(result)]);
};
