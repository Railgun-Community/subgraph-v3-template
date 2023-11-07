import { Bytes, BigInt, Address, log } from '@graphprotocol/graph-ts';
import { PoseidonT4 } from './class/PoseidonT4';
import { getPoseidonT4ContractAddress } from './contracts';
import { AccumulatorStateUpdateUpdateTransactionsUnshieldPreimageStruct } from '../generated/PoseidonMerkleAccumulator/PoseidonMerkleAccumulator';
import { getTokenHash } from './token';
import { padHexString, reversedBytesToBigInt } from './utils';
import { crypto } from '@graphprotocol/graph-ts';

export const poseidonT4Hash = (
  input1: BigInt,
  input2: BigInt,
  input3: BigInt,
): BigInt => {
  const addressHex = getPoseidonT4ContractAddress();
  const contractAddress = Address.fromString(addressHex);
  const poseidonContract = PoseidonT4.bind(contractAddress);
  let callResult = poseidonContract.try_poseidon1([input1, input2, input3]);
  if (callResult.reverted) {
    throw new Error('Poseidon hash call reverted');
  }
  return callResult.value;
};

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

export const calculateRailgunTransactionVerificationHash = (
  previousVerificationHash: Bytes | null,
  firstNullifier: Bytes,
): Bytes => {
  // hash[n] = keccak(hash[n-1] ?? 0, n_firstNullifier);
  const combinedData: Bytes = previousVerificationHash
    ? previousVerificationHash.concat(firstNullifier)
    : Bytes.fromHexString('0x').concat(firstNullifier);
  return Bytes.fromHexString(
    padHexString(crypto.keccak256(combinedData).toHexString(), 32),
  );
};
