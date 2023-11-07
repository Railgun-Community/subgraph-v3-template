import { describe, test } from 'matchstick-as/assembly/index';
import { handleAccumulatorStateUpdate } from '../../src/poseidon-merkle-accumulator-events';
import { createAccumulatorStateUpdateEvent } from '../util/event-utils.test';

describe('poseidon-merkle-accumulator-events', () => {
  test('Should process AccumulatorStateUpdate', () => {
    const event = createAccumulatorStateUpdateEvent();

    handleAccumulatorStateUpdate(event);
  });
});
