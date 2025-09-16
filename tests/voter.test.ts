import { assert, describe, test, clearStore, beforeAll, afterAll } from 'matchstick-as/assembly/index';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Abstained } from '../generated/schema';
import { Abstained as AbstainedEvent } from '../generated/Voter/Voter';
import { handleAbstained } from '../src/voter';
import { createAbstainedEvent } from './voter-utils';

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe('Describe entity assertions', () => {
    beforeAll(() => {
        let voter = Address.fromString('0x0000000000000000000000000000000000000001');
        let pool = Address.fromString('0x0000000000000000000000000000000000000001');
        let tokenId = BigInt.fromI32(234);
        let weight = BigInt.fromI32(234);
        let totalWeight = BigInt.fromI32(234);
        let timestamp = BigInt.fromI32(234);
        let newAbstainedEvent = createAbstainedEvent(voter, pool, tokenId, weight, totalWeight, timestamp);
        handleAbstained(newAbstainedEvent);
    });

    afterAll(() => {
        clearStore();
    });

    // For more test scenarios, see:
    // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

    test('Abstained created and stored', () => {
        assert.entityCount('Abstained', 1);

        // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
        assert.fieldEquals(
            'Abstained',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'voter',
            '0x0000000000000000000000000000000000000001',
        );
        assert.fieldEquals(
            'Abstained',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'pool',
            '0x0000000000000000000000000000000000000001',
        );
        assert.fieldEquals('Abstained', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1', 'tokenId', '234');
        assert.fieldEquals('Abstained', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1', 'weight', '234');
        assert.fieldEquals('Abstained', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1', 'totalWeight', '234');
        assert.fieldEquals('Abstained', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1', 'timestamp', '234');

        // More assert options:
        // https://thegraph.com/docs/en/developer/matchstick/#asserts
    });
});
