import { assert, describe, test, clearStore, beforeAll, afterAll } from 'matchstick-as/assembly/index';
import { Address } from '@graphprotocol/graph-ts';
import { DefaultUnstakedFeeChanged } from '../generated/schema';
import { DefaultUnstakedFeeChanged as DefaultUnstakedFeeChangedEvent } from '../generated/CLFactory/CLFactory';
import { handleDefaultUnstakedFeeChanged } from '../src/cl-factory';
import { createDefaultUnstakedFeeChangedEvent } from './cl-factory-utils';

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe('Describe entity assertions', () => {
    beforeAll(() => {
        let oldUnstakedFee = 123;
        let newUnstakedFee = 123;
        let newDefaultUnstakedFeeChangedEvent = createDefaultUnstakedFeeChangedEvent(oldUnstakedFee, newUnstakedFee);
        handleDefaultUnstakedFeeChanged(newDefaultUnstakedFeeChangedEvent);
    });

    afterAll(() => {
        clearStore();
    });

    // For more test scenarios, see:
    // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

    test('DefaultUnstakedFeeChanged created and stored', () => {
        assert.entityCount('DefaultUnstakedFeeChanged', 1);

        // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
        assert.fieldEquals(
            'DefaultUnstakedFeeChanged',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'oldUnstakedFee',
            '123',
        );
        assert.fieldEquals(
            'DefaultUnstakedFeeChanged',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'newUnstakedFee',
            '123',
        );

        // More assert options:
        // https://thegraph.com/docs/en/developer/matchstick/#asserts
    });
});
