import { describe, test } from 'matchstick-as/assembly/index';
import { handleAccumulatorStateUpdate } from '../../src/poseidon-merkle-accumulator-events';
import { createAccumulatorStateUpdateEvent } from '../util/event-utils.test';
import { createMockPoseidonT4Call } from '../util/mock-calls.test';
import { BigInt } from '@graphprotocol/graph-ts';

describe('poseidon-merkle-accumulator-events', () => {
  test('Should process AccumulatorStateUpdate', () => {
    createMockPoseidonT4Call(
      BigInt.fromString(
        '7719590407422755457164515728012380894578976603563602540388407402007342057608',
      ),
      BigInt.fromString('97433442511412352346923430580824580583949948245'),
      BigInt.fromString('1000000000'),
      BigInt.fromString('1'), // Return value
    );
    createMockPoseidonT4Call(
      BigInt.fromString(
        '7719590407422755457164515728012380894578976603563602540388407402007342057608',
      ),
      BigInt.fromString('97433442511412352346923430580824580583949948245'),
      BigInt.fromString('2000000000'),
      BigInt.fromString('2'), // Return value
    );

    const event = createAccumulatorStateUpdateEvent();

    handleAccumulatorStateUpdate(event);
  });
});
