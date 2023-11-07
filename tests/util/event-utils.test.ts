import { newMockEvent } from 'matchstick-as';
import { ethereum, Bytes, BigInt, Address } from '@graphprotocol/graph-ts';
import { AccumulatorStateUpdate as AccumulatorStateUpdateEvent } from '../../generated/PoseidonMerkleAccumulator/PoseidonMerkleAccumulator';

const ETHEREUM_CONTRACT = Address.fromString(
  '0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9',
);

const addReceiptContractAddress = (event: ethereum.Event): void => {
  changetype<ethereum.TransactionReceipt>(
    event.receipt,
  ).contractAddress = ETHEREUM_CONTRACT;
};

export const createAccumulatorStateUpdateEvent = (): AccumulatorStateUpdateEvent => {
  const event: AccumulatorStateUpdateEvent = changetype<
    AccumulatorStateUpdateEvent
  >(newMockEvent());

  event.parameters = [];

  const commitments: Bytes[] = [
    Bytes.fromHexString(
      '0x1111222233334444555566667777888811112222333344445555666677778888',
    ),
    Bytes.fromHexString(
      '0x1234567890123456789012345678901234567890123456789012345678901234',
    ),
    Bytes.fromHexString(
      '0x0000000099999999888888887777777766666666555555554444444433333333',
    ),
  ];

  // transactions: AccumulatorStateUpdateUpdateTransactionsStruct[]
  const transactions: ethereum.Tuple[] = [
    changetype<ethereum.Tuple>([
      // nullifiers: Bytes[]
      ethereum.Value.fromBytesArray([
        Bytes.fromHexString(
          '0x1111222233334444555566667777888811112222333344445555666677778888',
        ),
      ]),
      // commitmentsCount: i32
      ethereum.Value.fromI32(changetype<i32>(3)),
      // spendAccumulatorNumber: BigInt
      ethereum.Value.fromUnsignedBigInt(BigInt.zero()),
      // unshieldPreimage: AccumulatorStateUpdateUpdateTransactionsUnshieldPreimageStruct
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          // npk: Bytes
          ethereum.Value.fromBytes(
            Bytes.fromHexString(
              '0x1111222233334444555566667777888811112222333344445555666677778888',
            ),
          ),
          // token: AccumulatorStateUpdateUpdateTransactionsUnshieldPreimageTokenStruct
          ethereum.Value.fromTuple(
            changetype<ethereum.Tuple>([
              // tokenType: i32
              ethereum.Value.fromI32(changetype<i32>(0)),
              // tokenAddress: Address
              ethereum.Value.fromAddress(
                Address.fromString(
                  '0x1111111122222222333333334444444455555555',
                ),
              ),
              // tokenSubID: BigInt
              ethereum.Value.fromUnsignedBigInt(BigInt.zero()),
            ]),
          ),
          // value: BigInt
          ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000')),
        ]),
      ),
      // boundParamsHash: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x1111222233334444555566667777888811112222333344445555666677778888',
        ),
      ),
    ]),
  ];

  // shields: AccumulatorStateUpdateUpdateShieldsStruct[]
  const shields: ethereum.Tuple[] = changetype<ethereum.Tuple[]>([
    changetype<ethereum.Tuple>([
      // from: Address
      ethereum.Value.fromAddress(
        Address.fromString('0x1111111122222222333333334444444455555555'),
      ),
      // preimage: AccumulatorStateUpdateUpdateShieldsPreimageStruct
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          // npk: Bytes
          ethereum.Value.fromBytes(
            Bytes.fromHexString(
              '0x1111222233334444555566667777888811112222333344445555666677778888',
            ),
          ),
          // token: AccumulatorStateUpdateUpdateTransactionsUnshieldPreimageTokenStruct
          ethereum.Value.fromTuple(
            changetype<ethereum.Tuple>([
              // tokenType: i32
              ethereum.Value.fromI32(changetype<i32>(0)),
              // tokenAddress: Address
              ethereum.Value.fromAddress(
                Address.fromString(
                  '0x1111111122222222333333334444444455555555',
                ),
              ),
              // tokenSubID: BigInt
              ethereum.Value.fromUnsignedBigInt(BigInt.zero()),
            ]),
          ),
          // value: BigInt
          ethereum.Value.fromUnsignedBigInt(BigInt.fromString('2000000000')),
        ]),
      ),
      // ciphertext: AccumulatorStateUpdateUpdateShieldsCiphertextStruct
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          // encryptedBundle: Bytes[]
          ethereum.Value.fromBytesArray([
            Bytes.fromHexString(
              '0x1111222233334444555566667777888811112222333344445555666677778888',
            ),
            Bytes.fromHexString(
              '0x1111222233334444555566667777888811112222333344445555666677778888',
            ),
          ]),
          // shieldKey: Bytes
          ethereum.Value.fromBytes(
            Bytes.fromHexString(
              '0x1111222233334444555566667777888811112222333344445555666677778888',
            ),
          ),
        ]),
      ),
    ]),
  ]);

  // commitmentCiphertext: AccumulatorStateUpdateUpdateCommitmentCiphertextStruct[]
  const commitmentCiphertext: ethereum.Tuple[] = changetype<ethereum.Tuple[]>([
    changetype<ethereum.Tuple>([
      // ciphertext: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x1010101010101010202020202020202030303030303030304040404040404040',
        ),
      ),
      // blindedSenderViewingKey: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x5050505050505050606060606060606070707070707070708080808080808080',
        ),
      ),
      // blindedReceiverViewingKey: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x9090909090909090a0a0a0a0a0a0a0a0b0b0b0b0b0b0b0b0c0c0c0c0c0c0c0c0',
        ),
      ),
    ]),
    changetype<ethereum.Tuple>([
      // ciphertext: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x1717171717171717272727272727272737373737373737374747474747474747',
        ),
      ),
      // blindedSenderViewingKey: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x5353535353535353636363636363636373737373737373738383838383838383',
        ),
      ),
      // blindedReceiverViewingKey: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x9292929292929292a2a2a2a2a2a2a2a2b2b2b2b2b2b2b2b2c2c2c2c2c2c2c2c2',
        ),
      ),
    ]),
    changetype<ethereum.Tuple>([
      // ciphertext: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x1919191919191919292929292929292939393939393939394949494949494949',
        ),
      ),
      // blindedSenderViewingKey: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x5151515151515151616161616161616171717171717171718181818181818181',
        ),
      ),
      // blindedReceiverViewingKey: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x9696969696969696a6a6a6a6a6a6a6a6b6b6b6b6b6b6b6b6c6c6c6c6c6c6c6c6',
        ),
      ),
    ]),
  ]);

  // treasuryFees: AccumulatorStateUpdateUpdateTreasuryFeesStruct[]
  const treasuryFees: ethereum.Tuple[] = [
    changetype<ethereum.Tuple>([
      // tokenID: Bytes
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0x0000000000000000000000001111111122222222333333334444444455555555',
        ),
      ),
      // fee: BigInt
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString('2500000')),
    ]),
  ];

  // senderCiphertext: Bytes
  const senderCiphertext: Bytes = Bytes.fromHexString('0x12345678901234567890');

  const tupleUpdate: ethereum.Tuple = changetype<ethereum.Tuple>([
    // commitments
    ethereum.Value.fromBytesArray(commitments),
    // transactions
    ethereum.Value.fromTupleArray(transactions),
    // shields
    ethereum.Value.fromTupleArray(shields),
    // commitmentCiphertext
    ethereum.Value.fromTupleArray(commitmentCiphertext),
    // treasuryFees
    ethereum.Value.fromTupleArray(treasuryFees),
    // senderCiphertext
    ethereum.Value.fromBytes(senderCiphertext),
  ]);

  event.parameters.push(
    new ethereum.EventParam('update', ethereum.Value.fromTuple(tupleUpdate)),
  );

  const accumulatorNumber = BigInt.zero();
  event.parameters.push(
    new ethereum.EventParam(
      'accumulatorNumber',
      ethereum.Value.fromUnsignedBigInt(accumulatorNumber),
    ),
  );

  const startPosition = BigInt.zero();
  event.parameters.push(
    new ethereum.EventParam(
      'startPosition',
      ethereum.Value.fromUnsignedBigInt(startPosition),
    ),
  );

  addReceiptContractAddress(event);

  return event;
};
