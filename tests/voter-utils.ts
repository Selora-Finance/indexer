import { newMockEvent } from 'matchstick-as';
import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts';
import {
    Abstained,
    DistributeReward,
    GaugeCreated,
    GaugeKilled,
    GaugeRevived,
    NotifyReward,
    Voted,
    WhitelistNFT,
    WhitelistToken,
} from '../generated/Voter/Voter';

export function createAbstainedEvent(
    voter: Address,
    pool: Address,
    tokenId: BigInt,
    weight: BigInt,
    totalWeight: BigInt,
    timestamp: BigInt,
): Abstained {
    let abstainedEvent = changetype<Abstained>(newMockEvent());

    abstainedEvent.parameters = new Array();

    abstainedEvent.parameters.push(new ethereum.EventParam('voter', ethereum.Value.fromAddress(voter)));
    abstainedEvent.parameters.push(new ethereum.EventParam('pool', ethereum.Value.fromAddress(pool)));
    abstainedEvent.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)));
    abstainedEvent.parameters.push(new ethereum.EventParam('weight', ethereum.Value.fromUnsignedBigInt(weight)));
    abstainedEvent.parameters.push(
        new ethereum.EventParam('totalWeight', ethereum.Value.fromUnsignedBigInt(totalWeight)),
    );
    abstainedEvent.parameters.push(new ethereum.EventParam('timestamp', ethereum.Value.fromUnsignedBigInt(timestamp)));

    return abstainedEvent;
}

export function createDistributeRewardEvent(sender: Address, gauge: Address, amount: BigInt): DistributeReward {
    let distributeRewardEvent = changetype<DistributeReward>(newMockEvent());

    distributeRewardEvent.parameters = new Array();

    distributeRewardEvent.parameters.push(new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender)));
    distributeRewardEvent.parameters.push(new ethereum.EventParam('gauge', ethereum.Value.fromAddress(gauge)));
    distributeRewardEvent.parameters.push(new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)));

    return distributeRewardEvent;
}

export function createGaugeCreatedEvent(
    poolFactory: Address,
    votingRewardsFactory: Address,
    gaugeFactory: Address,
    pool: Address,
    bribeVotingReward: Address,
    feeVotingReward: Address,
    gauge: Address,
    creator: Address,
): GaugeCreated {
    let gaugeCreatedEvent = changetype<GaugeCreated>(newMockEvent());

    gaugeCreatedEvent.parameters = new Array();

    gaugeCreatedEvent.parameters.push(new ethereum.EventParam('poolFactory', ethereum.Value.fromAddress(poolFactory)));
    gaugeCreatedEvent.parameters.push(
        new ethereum.EventParam('votingRewardsFactory', ethereum.Value.fromAddress(votingRewardsFactory)),
    );
    gaugeCreatedEvent.parameters.push(
        new ethereum.EventParam('gaugeFactory', ethereum.Value.fromAddress(gaugeFactory)),
    );
    gaugeCreatedEvent.parameters.push(new ethereum.EventParam('pool', ethereum.Value.fromAddress(pool)));
    gaugeCreatedEvent.parameters.push(
        new ethereum.EventParam('bribeVotingReward', ethereum.Value.fromAddress(bribeVotingReward)),
    );
    gaugeCreatedEvent.parameters.push(
        new ethereum.EventParam('feeVotingReward', ethereum.Value.fromAddress(feeVotingReward)),
    );
    gaugeCreatedEvent.parameters.push(new ethereum.EventParam('gauge', ethereum.Value.fromAddress(gauge)));
    gaugeCreatedEvent.parameters.push(new ethereum.EventParam('creator', ethereum.Value.fromAddress(creator)));

    return gaugeCreatedEvent;
}

export function createGaugeKilledEvent(gauge: Address): GaugeKilled {
    let gaugeKilledEvent = changetype<GaugeKilled>(newMockEvent());

    gaugeKilledEvent.parameters = new Array();

    gaugeKilledEvent.parameters.push(new ethereum.EventParam('gauge', ethereum.Value.fromAddress(gauge)));

    return gaugeKilledEvent;
}

export function createGaugeRevivedEvent(gauge: Address): GaugeRevived {
    let gaugeRevivedEvent = changetype<GaugeRevived>(newMockEvent());

    gaugeRevivedEvent.parameters = new Array();

    gaugeRevivedEvent.parameters.push(new ethereum.EventParam('gauge', ethereum.Value.fromAddress(gauge)));

    return gaugeRevivedEvent;
}

export function createNotifyRewardEvent(sender: Address, reward: Address, amount: BigInt): NotifyReward {
    let notifyRewardEvent = changetype<NotifyReward>(newMockEvent());

    notifyRewardEvent.parameters = new Array();

    notifyRewardEvent.parameters.push(new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender)));
    notifyRewardEvent.parameters.push(new ethereum.EventParam('reward', ethereum.Value.fromAddress(reward)));
    notifyRewardEvent.parameters.push(new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)));

    return notifyRewardEvent;
}

export function createVotedEvent(
    voter: Address,
    pool: Address,
    tokenId: BigInt,
    weight: BigInt,
    totalWeight: BigInt,
    timestamp: BigInt,
): Voted {
    let votedEvent = changetype<Voted>(newMockEvent());

    votedEvent.parameters = new Array();

    votedEvent.parameters.push(new ethereum.EventParam('voter', ethereum.Value.fromAddress(voter)));
    votedEvent.parameters.push(new ethereum.EventParam('pool', ethereum.Value.fromAddress(pool)));
    votedEvent.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)));
    votedEvent.parameters.push(new ethereum.EventParam('weight', ethereum.Value.fromUnsignedBigInt(weight)));
    votedEvent.parameters.push(new ethereum.EventParam('totalWeight', ethereum.Value.fromUnsignedBigInt(totalWeight)));
    votedEvent.parameters.push(new ethereum.EventParam('timestamp', ethereum.Value.fromUnsignedBigInt(timestamp)));

    return votedEvent;
}

export function createWhitelistNFTEvent(whitelister: Address, tokenId: BigInt, _bool: boolean): WhitelistNFT {
    let whitelistNftEvent = changetype<WhitelistNFT>(newMockEvent());

    whitelistNftEvent.parameters = new Array();

    whitelistNftEvent.parameters.push(new ethereum.EventParam('whitelister', ethereum.Value.fromAddress(whitelister)));
    whitelistNftEvent.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)));
    whitelistNftEvent.parameters.push(new ethereum.EventParam('_bool', ethereum.Value.fromBoolean(_bool)));

    return whitelistNftEvent;
}

export function createWhitelistTokenEvent(whitelister: Address, token: Address, _bool: boolean): WhitelistToken {
    let whitelistTokenEvent = changetype<WhitelistToken>(newMockEvent());

    whitelistTokenEvent.parameters = new Array();

    whitelistTokenEvent.parameters.push(
        new ethereum.EventParam('whitelister', ethereum.Value.fromAddress(whitelister)),
    );
    whitelistTokenEvent.parameters.push(new ethereum.EventParam('token', ethereum.Value.fromAddress(token)));
    whitelistTokenEvent.parameters.push(new ethereum.EventParam('_bool', ethereum.Value.fromBoolean(_bool)));

    return whitelistTokenEvent;
}
