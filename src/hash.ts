import { Bytes, BigInt, Address, log } from '@graphprotocol/graph-ts';
import { PoseidonT4 } from './class/PoseidonT4';
import { getPoseidonT4ContractAddress } from './contracts';
import { AccumulatorStateUpdateUpdateTransactionsUnshieldPreimageStruct } from '../generated/PoseidonMerkleAccumulator/PoseidonMerkleAccumulator';
import { getTokenHash } from './token';
import { reversedBytesToBigInt } from './utils';

export const poseidonT4Hash = (
  input1: BigInt,
  input2: BigInt,
  input3: BigInt,
): BigInt => {
  log.debug('poseidon inputs: {} {} {}', [
    input1.toString(),
    input2.toString(),
    input3.toString(),
  ]);

  const addressHex = getPoseidonT4ContractAddress();
  const contractAddress = Address.fromString(addressHex);
  const poseidonContract = PoseidonT4.bind(contractAddress);
  let callResult = poseidonContract.try_poseidon1([input1, input2, input3]);
  if (callResult.reverted) {
    throw new Error('Poseidon hash call reverted');
  }
  return callResult.value;
};

// export const poseidonT4HashMulti = (inputs: BigInt[]): BigInt => {
//   const addressHex = getPoseidonT4ContractAddress();
//   const contractAddress = Address.fromString(addressHex);
//   const poseidonContract = PoseidonT4.bind(contractAddress);
//   let callResult = poseidonContract.try_poseidon1(inputs);
//   if (callResult.reverted) {
//     throw new Error('Poseidon hash call reverted');
//   }
//   return callResult.value;
// };

export const getNoteHash = (
  npk: BigInt,
  tokenHash: BigInt,
  value: BigInt,
): BigInt => {
  return poseidonT4Hash(npk, tokenHash, value);
};

export const getUnshieldPreImageNoteHash = (
  preimage: AccumulatorStateUpdateUpdateTransactionsUnshieldPreimageStruct,
): BigInt => {
  const tokenHash = getTokenHash(
    preimage.token.tokenType,
    preimage.token.tokenAddress,
    preimage.token.tokenSubID,
  );
  return getNoteHash(
    reversedBytesToBigInt(preimage.npk),
    reversedBytesToBigInt(tokenHash),
    preimage.value,
  );
};

// export const getRailgunTransactionID = (
//   nullifiers: Bytes[],
//   commitments: Bytes[],
//   boundParamsHash: Bytes,
//   unshieldCommitmentHash: BigInt | null,
// ): BigInt => {
//   const nullifiersBigInt = nullifiers.map<BigInt>((nullifier) =>
//     reversedBytesToBigInt(nullifier),
//   );
//   const commitmentsBigInt = commitments.map<BigInt>((commitment) =>
//     reversedBytesToBigInt(commitment),
//   );
//   const boundParamsHashBigInt = reversedBytesToBigInt(boundParamsHash);
//   const commitmentsWithUnshieldHash = unshieldCommitmentHash
//     ? commitmentsBigInt.concat([unshieldCommitmentHash])
//     : commitmentsBigInt;
//   return poseidonT4Hash(
//     poseidonT4HashMulti(nullifiersBigInt),
//     poseidonT4HashMulti(commitmentsWithUnshieldHash),
//     boundParamsHashBigInt,
//   );
// };
