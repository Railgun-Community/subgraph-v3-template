import { Bytes, BigInt } from '@graphprotocol/graph-ts';
import {
  CommitmentPreimage,
  Token,
  CommitmentCiphertext,
  ShieldCommitment,
  TransactCommitment,
  Unshield,
  Nullifier,
  RailgunTransaction,
} from '../generated/schema';
import { getTokenHash, getTokenTypeEnum } from './token';
import { bigIntToBytes } from './utils';

export const saveToken = (
  tokenType: i32,
  tokenAddress: Bytes,
  tokenSubID: BigInt,
): Token => {
  const tokenSubIDBytes = bigIntToBytes(tokenSubID);
  const id = getTokenHash(tokenType, tokenAddress, tokenSubID);

  // Token can be a duplicate for hash, but is immutable in DB.
  // Check if it already exists.
  const loaded = Token.load(id);
  if (loaded) {
    return loaded;
  }

  const entity = new Token(id);

  entity.tokenType = getTokenTypeEnum(tokenType);
  entity.tokenAddress = tokenAddress;
  entity.tokenSubID = tokenSubIDBytes;

  entity.save();
  return entity;
};

export const saveCommitmentPreimage = (
  id: Bytes,
  npk: Bytes,
  token: Token,
  value: BigInt,
): CommitmentPreimage => {
  const entity = new CommitmentPreimage(id);

  entity.npk = npk;
  entity.token = token.id;
  entity.value = value;

  entity.save();
  return entity;
};

export const saveCommitmentCiphertext = (
  id: Bytes,
  ciphertext: Bytes,
  blindedSenderViewingKey: Bytes,
  blindedReceiverViewingKey: Bytes,
): CommitmentCiphertext => {
  const entity = new CommitmentCiphertext(id);

  entity.ciphertext = ciphertext;
  entity.blindedSenderViewingKey = blindedSenderViewingKey;
  entity.blindedReceiverViewingKey = blindedReceiverViewingKey;

  entity.save();
  return entity;
};

export const saveNullifier = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  treeNumber: BigInt,
  nullifier: Bytes,
): Nullifier => {
  const entity = new Nullifier(id);

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;

  // Custom required values
  entity.treeNumber = treeNumber.toI32();
  entity.nullifier = nullifier;

  entity.save();
  return entity;
};

export const saveShieldCommitment = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  treeNumber: BigInt,
  treePosition: BigInt,
  from: Bytes,
  commitmentHash: Bytes,
  preimage: CommitmentPreimage,
  encryptedBundle: Bytes[],
  shieldKey: Bytes,
  fee: BigInt,
): ShieldCommitment => {
  const entity = new ShieldCommitment(id);

  entity.commitmentType = 'ShieldCommitment';

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.treeNumber = treeNumber.toI32();

  // Custom values: Shield event
  entity.from = from;
  entity.treePosition = treePosition.toI32();
  entity.hashes = [commitmentHash];
  entity.preimage = preimage.id;
  entity.encryptedBundle = encryptedBundle;
  entity.shieldKey = shieldKey;
  entity.fee = fee;

  entity.save();
  return entity;
};

export const saveTransactCommitment = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  treeNumber: BigInt,
  batchStartTreePosition: BigInt,
  commitmentHashes: Bytes[],
  commitmentCiphertexts: CommitmentCiphertext[],
): TransactCommitment => {
  const entity = new TransactCommitment(id);

  entity.commitmentType = 'TransactCommitment';

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.treeNumber = treeNumber.toI32();
  entity.batchStartTreePosition = batchStartTreePosition.toI32();

  // Custom values: CommitmentBatch event
  entity.hashes = commitmentHashes;
  entity.commitmentCiphertexts = commitmentCiphertexts.map<Bytes>(
    (commitmentCiphertext) => commitmentCiphertext.id,
  );

  entity.save();
  return entity;
};

export const saveUnshield = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  to: Bytes,
  token: Token,
  amount: BigInt,
  fee: BigInt,
  transactCommitmentBatchIndex: BigInt,
): Unshield => {
  const entity = new Unshield(id);

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;

  // Custom required values
  entity.to = to;
  entity.token = token.id;
  entity.amount = amount;
  entity.fee = fee;
  entity.transactCommitmentBatchIndex = transactCommitmentBatchIndex;

  entity.save();
  return entity;
};

export const saveRailgunTransaction = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  nullifiers: Bytes[],
  commitments: Bytes[],
  boundParams: Bytes,
  hasUnshield: boolean,
  utxoTreeIn: BigInt,
  utxoTree: BigInt,
  utxoBatchStartPositionOut: BigInt,
  unshieldToken: Token,
  unshieldToAddress: Bytes,
  unshieldValue: BigInt,
  verificationHash: Bytes,
): RailgunTransaction => {
  const entity = new RailgunTransaction(id);

  entity.transactionHash = transactionHash;
  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.nullifiers = nullifiers;
  entity.commitments = commitments;
  entity.boundParamsHash = boundParams;
  entity.hasUnshield = hasUnshield;
  entity.utxoTreeIn = utxoTreeIn;
  entity.utxoTreeOut = utxoTree;
  entity.utxoBatchStartPositionOut = utxoBatchStartPositionOut;
  entity.unshieldToken = unshieldToken.id;
  entity.unshieldToAddress = unshieldToAddress;
  entity.unshieldValue = unshieldValue;
  entity.verificationHash = verificationHash;

  entity.save();
  return entity;
};
