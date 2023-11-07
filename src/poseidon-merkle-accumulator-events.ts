import { Bytes, BigInt } from '@graphprotocol/graph-ts';
import {
  AccumulatorStateUpdate as AccumulatorStateUpdateEvent,
  AccumulatorStateUpdateUpdateCommitmentCiphertextStruct,
  AccumulatorStateUpdateUpdateShieldsStruct,
  AccumulatorStateUpdateUpdateTransactionsStruct,
  AccumulatorStateUpdateUpdateTransactionsUnshieldPreimageStruct,
} from '../generated/PoseidonMerkleAccumulator/PoseidonMerkleAccumulator';
import { bigIntToBytes, reversedBytesToBigInt } from './utils';
import {
  saveCommitmentCiphertext,
  saveCommitmentPreimage,
  saveNullifier,
  saveRailgunTransaction,
  saveShieldCommitment,
  saveToken,
  saveTransactCommitment,
  saveUnshield,
} from './entity';
import { idFrom2PaddedBigInts, idFrom3PaddedBigInts } from './id';
import {
  calculateRailgunTransactionVerificationHash,
  getNoteHash,
  getUnshieldPreImageNoteHash,
} from './hash';
import { getTokenHash } from './token';
import { TreasuryFeeMap, getTreasuryFeeMap } from './treasury-fee-map';
import { CommitmentCiphertext, VerificationHash } from '../generated/schema';

const TREE_MAX_ITEMS = BigInt.fromString('65536');
const BIGINT_ONE = BigInt.fromString('1');

export function handleAccumulatorStateUpdate(
  event: AccumulatorStateUpdateEvent,
): void {
  const update = event.params.update;
  const accumulatorNumber = event.params.accumulatorNumber;
  const startPosition = event.params.startPosition;

  const commitments = update.commitments;
  const transactions = update.transactions;
  const shields = update.shields;
  const commitmentCiphertext = update.commitmentCiphertext;
  const treasuryFees = update.treasuryFees;
  const senderCiphertext = update.senderCiphertext;

  const treasuryFeeMap = getTreasuryFeeMap(transactions, shields, treasuryFees);

  let utxoTree = accumulatorNumber;
  let utxoStartPosition = startPosition;

  const totalCommitmentsCount = handleTransactions(
    event,
    commitments,
    transactions,
    commitmentCiphertext,
    senderCiphertext,
    treasuryFeeMap,
    utxoTree,
    utxoStartPosition,
  );

  for (
    let i = BigInt.zero();
    i < totalCommitmentsCount;
    i = i.plus(BIGINT_ONE)
  ) {
    utxoStartPosition = utxoStartPosition.plus(BIGINT_ONE);
    if (utxoStartPosition >= TREE_MAX_ITEMS) {
      utxoStartPosition = BigInt.zero();
      utxoTree = utxoTree.plus(BIGINT_ONE);
    }
  }

  handleShields(event, shields, treasuryFeeMap, utxoTree, utxoStartPosition);
}

function handleTransactions(
  event: AccumulatorStateUpdateEvent,
  commitments: Bytes[],
  transactions: AccumulatorStateUpdateUpdateTransactionsStruct[],
  commitmentCiphertext: AccumulatorStateUpdateUpdateCommitmentCiphertextStruct[],
  senderCiphertext: Bytes,
  treasuryFeeMap: TreasuryFeeMap,
  utxoTree: BigInt,
  utxoStartPosition: BigInt,
): BigInt {
  let commitmentsStartIndex = 0;
  let totalCommitmentsCount = BigInt.zero();

  for (let i = 0; i < transactions.length; i += 1) {
    const transaction = transactions[i];

    const nullifiers = transaction.nullifiers;
    const commitmentsCount = transaction.commitmentsCount;
    const spendAccumulatorNumber = transaction.spendAccumulatorNumber;
    const unshieldPreimage = transaction.unshieldPreimage;
    const boundParamsHash = transaction.boundParamsHash;

    const commitmentsEndIndex = commitmentsStartIndex + commitmentsCount;
    const commitmentHashes = commitments.slice(
      commitmentsStartIndex,
      commitmentsEndIndex,
    );
    const commitmentCiphertexts = commitmentCiphertext.slice(
      commitmentsStartIndex,
      commitmentsEndIndex,
    );
    if (commitmentHashes.length !== commitmentsCount) {
      throw new Error(
        'Expected commitmentHashes length to match commitmentsCount',
      );
    }
    if (commitmentCiphertexts.length !== commitmentsCount) {
      throw new Error(
        `Expected commitmentCiphertexts length to match commitmentsCount: ${commitmentCiphertexts.length} !== ${commitmentsCount}`,
      );
    }
    commitmentsStartIndex = commitmentsEndIndex;

    const utxoTreeIn = spendAccumulatorNumber;

    const transactIndex = BigInt.fromString(i.toString());

    handleRailgunTransaction(
      event,
      nullifiers,
      commitmentHashes,
      boundParamsHash,
      unshieldPreimage,
      utxoTreeIn,
      utxoTree,
      utxoStartPosition,
      transactIndex,
    );

    const transactEventID = idFrom2PaddedBigInts(utxoTree, utxoStartPosition);

    let transactCommitmentCiphertexts: CommitmentCiphertext[] = [];
    for (let j = 0; j < commitmentCiphertexts.length; j += 1) {
      const commitmentCiphertextID = idFrom2PaddedBigInts(
        utxoTree,
        utxoStartPosition.plus(BigInt.fromString(j.toString())),
      );
      transactCommitmentCiphertexts.push(
        saveCommitmentCiphertext(
          commitmentCiphertextID,
          commitmentCiphertexts[j].ciphertext,
          commitmentCiphertexts[j].blindedSenderViewingKey,
          commitmentCiphertexts[j].blindedReceiverViewingKey,
        ),
      );
    }

    saveTransactCommitment(
      transactEventID,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      utxoTree,
      utxoStartPosition,
      transactIndex,
      commitmentHashes,
      transactCommitmentCiphertexts,
      senderCiphertext,
    );

    for (let j = 0; j < nullifiers.length; j += 1) {
      const nullifier = nullifiers[j];
      const nullifierID = idFrom2PaddedBigInts(
        spendAccumulatorNumber,
        reversedBytesToBigInt(nullifier),
      );
      saveNullifier(
        nullifierID,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash,
        spendAccumulatorNumber,
        nullifier,
      );
    }

    const hasUnshield = !unshieldPreimage.value.equals(BigInt.zero());
    if (hasUnshield) {
      const totalUnshieldValuesForToken = transactions.reduce((acc, curr) => {
        return acc.plus(curr.unshieldPreimage.value);
      }, BigInt.zero());
      const unshieldTokenHashString = getTokenHash(
        unshieldPreimage.token.tokenType,
        unshieldPreimage.token.tokenAddress,
        unshieldPreimage.token.tokenSubID,
      ).toHexString();
      const isERC20 = unshieldPreimage.token.tokenType === 0;
      if (isERC20 && !treasuryFeeMap.has(unshieldTokenHashString)) {
        throw new Error('Expected unshield token hash in treasuryFeeMap');
      }
      const unshieldFee = totalUnshieldValuesForToken.gt(BigInt.zero())
        ? treasuryFeeMap
            .get(unshieldTokenHashString)[1]
            .times(unshieldPreimage.value)
            .div(totalUnshieldValuesForToken)
        : BigInt.zero();

      const unshieldID = idFrom3PaddedBigInts(
        event.block.number,
        event.logIndex,
        transactIndex,
      );

      const token = saveToken(
        unshieldPreimage.token.tokenType,
        unshieldPreimage.token.tokenAddress,
        unshieldPreimage.token.tokenSubID,
      );

      saveUnshield(
        unshieldID,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash,
        unshieldPreimage.npk,
        token,
        unshieldPreimage.value,
        unshieldFee,
        transactIndex,
      );
    }

    totalCommitmentsCount = totalCommitmentsCount.plus(
      BigInt.fromString(commitmentsCount.toString()),
    );

    utxoStartPosition = utxoStartPosition.plus(
      BigInt.fromString(commitmentsCount.toString()),
    );
    if (utxoStartPosition >= TREE_MAX_ITEMS) {
      utxoStartPosition = BigInt.zero();
      utxoTree = utxoTree.plus(BIGINT_ONE);
    }
  }

  return totalCommitmentsCount;
}

function handleShields(
  event: AccumulatorStateUpdateEvent,
  shields: AccumulatorStateUpdateUpdateShieldsStruct[],
  treasuryFeeMap: TreasuryFeeMap,
  utxoTree: BigInt,
  utxoStartPosition: BigInt,
): void {
  for (let i = 0; i < shields.length; i += 1) {
    const shield = shields[i];

    const totalShieldValuesForToken = shields.reduce((acc, curr) => {
      return acc.plus(curr.preimage.value);
    }, BigInt.zero());

    const preimage = shield.preimage;
    const shieldTokenHash = getTokenHash(
      preimage.token.tokenType,
      preimage.token.tokenAddress,
      preimage.token.tokenSubID,
    );
    const shieldTokenHashString = shieldTokenHash.toHexString();
    const isERC20 = preimage.token.tokenType === 0;
    if (isERC20 && !treasuryFeeMap.has(shieldTokenHashString)) {
      throw new Error('Expected shield token hash in treasuryFeeMap');
    }
    // Assume equal shield fees across each shield for this token.
    const shieldFee = totalShieldValuesForToken.gt(BigInt.zero())
      ? treasuryFeeMap
          .get(shieldTokenHashString)[1]
          .times(preimage.value)
          .div(totalShieldValuesForToken)
      : BigInt.zero();

    const commitmentHash = getNoteHash(
      reversedBytesToBigInt(preimage.npk),
      reversedBytesToBigInt(shieldTokenHash),
      preimage.value,
    );

    const shieldID = idFrom2PaddedBigInts(utxoTree, utxoStartPosition);

    const token = saveToken(
      preimage.token.tokenType,
      preimage.token.tokenAddress,
      preimage.token.tokenSubID,
    );

    const commitmentPreimage = saveCommitmentPreimage(
      shieldID,
      preimage.npk,
      token,
      preimage.value,
    );

    saveShieldCommitment(
      shieldID,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      utxoTree,
      utxoStartPosition,
      shield.from,
      bigIntToBytes(commitmentHash),
      commitmentPreimage,
      shield.ciphertext.encryptedBundle,
      shield.ciphertext.shieldKey,
      shieldFee,
    );

    utxoStartPosition = utxoStartPosition.plus(BIGINT_ONE);
    if (utxoStartPosition >= TREE_MAX_ITEMS) {
      utxoStartPosition = BigInt.zero();
      utxoTree = utxoTree.plus(BIGINT_ONE);
    }
  }
}

export function handleRailgunTransaction(
  event: AccumulatorStateUpdateEvent,
  nullifiers: Bytes[],
  commitmentHashes: Bytes[],
  boundParamsHash: Bytes,
  unshieldPreimage: AccumulatorStateUpdateUpdateTransactionsUnshieldPreimageStruct,
  utxoTreeIn: BigInt,
  utxoTree: BigInt,
  utxoStartPosition: BigInt,
  transactIndex: BigInt,
): void {
  const hasUnshield = !unshieldPreimage.value.equals(BigInt.zero());
  const hasOnlyUnshield = hasUnshield && commitmentHashes.length === 0;

  const commitmentsWithUnshieldHash = hasUnshield
    ? commitmentHashes.concat([
        bigIntToBytes(getUnshieldPreImageNoteHash(unshieldPreimage)),
      ])
    : commitmentHashes;

  const treeNumber = hasOnlyUnshield ? BigInt.fromI64(99999) : utxoTree;
  const batchStartTreePosition = hasOnlyUnshield
    ? BigInt.fromI64(99999)
    : utxoStartPosition;

  const tokenInfo = unshieldPreimage.token;
  const token = saveToken(
    tokenInfo.tokenType,
    tokenInfo.tokenAddress,
    tokenInfo.tokenSubID,
  );
  const id = idFrom3PaddedBigInts(
    event.block.number,
    event.logIndex,
    transactIndex,
  );

  const verificationHash = updateSavedRailgunTransactionVerificationHash(
    nullifiers[0],
  );

  saveRailgunTransaction(
    id,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
    nullifiers,
    commitmentsWithUnshieldHash,
    boundParamsHash,
    hasUnshield,
    utxoTreeIn,
    treeNumber,
    batchStartTreePosition,
    token,
    Bytes.fromUint8Array(unshieldPreimage.npk.slice(-20)),
    unshieldPreimage.value,
    verificationHash,
  );
}

function updateSavedRailgunTransactionVerificationHash(
  firstNullifier: Bytes,
): Bytes {
  let savedObj = VerificationHash.load(Bytes.empty());
  if (savedObj == null) {
    savedObj = new VerificationHash(Bytes.empty());
    savedObj.verificationHash = Bytes.empty();
  }
  savedObj.verificationHash = calculateRailgunTransactionVerificationHash(
    savedObj.verificationHash,
    firstNullifier,
  );
  savedObj.save();
  return savedObj.verificationHash;
}
