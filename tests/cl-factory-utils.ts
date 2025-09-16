import { newMockEvent } from 'matchstick-as';
import { ethereum, Address } from '@graphprotocol/graph-ts';
import {
    DefaultUnstakedFeeChanged,
    OwnerChanged,
    PoolCreated,
    SwapFeeManagerChanged,
    SwapFeeModuleChanged,
    TickSpacingEnabled,
    UnstakedFeeManagerChanged,
    UnstakedFeeModuleChanged,
} from '../generated/CLFactory/CLFactory';

export function createDefaultUnstakedFeeChangedEvent(
    oldUnstakedFee: i32,
    newUnstakedFee: i32,
): DefaultUnstakedFeeChanged {
    let defaultUnstakedFeeChangedEvent = changetype<DefaultUnstakedFeeChanged>(newMockEvent());

    defaultUnstakedFeeChangedEvent.parameters = new Array();

    defaultUnstakedFeeChangedEvent.parameters.push(
        new ethereum.EventParam('oldUnstakedFee', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(oldUnstakedFee))),
    );
    defaultUnstakedFeeChangedEvent.parameters.push(
        new ethereum.EventParam('newUnstakedFee', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newUnstakedFee))),
    );

    return defaultUnstakedFeeChangedEvent;
}

export function createOwnerChangedEvent(oldOwner: Address, newOwner: Address): OwnerChanged {
    let ownerChangedEvent = changetype<OwnerChanged>(newMockEvent());

    ownerChangedEvent.parameters = new Array();

    ownerChangedEvent.parameters.push(new ethereum.EventParam('oldOwner', ethereum.Value.fromAddress(oldOwner)));
    ownerChangedEvent.parameters.push(new ethereum.EventParam('newOwner', ethereum.Value.fromAddress(newOwner)));

    return ownerChangedEvent;
}

export function createPoolCreatedEvent(token0: Address, token1: Address, tickSpacing: i32, pool: Address): PoolCreated {
    let poolCreatedEvent = changetype<PoolCreated>(newMockEvent());

    poolCreatedEvent.parameters = new Array();

    poolCreatedEvent.parameters.push(new ethereum.EventParam('token0', ethereum.Value.fromAddress(token0)));
    poolCreatedEvent.parameters.push(new ethereum.EventParam('token1', ethereum.Value.fromAddress(token1)));
    poolCreatedEvent.parameters.push(new ethereum.EventParam('tickSpacing', ethereum.Value.fromI32(tickSpacing)));
    poolCreatedEvent.parameters.push(new ethereum.EventParam('pool', ethereum.Value.fromAddress(pool)));

    return poolCreatedEvent;
}

export function createSwapFeeManagerChangedEvent(
    oldFeeManager: Address,
    newFeeManager: Address,
): SwapFeeManagerChanged {
    let swapFeeManagerChangedEvent = changetype<SwapFeeManagerChanged>(newMockEvent());

    swapFeeManagerChangedEvent.parameters = new Array();

    swapFeeManagerChangedEvent.parameters.push(
        new ethereum.EventParam('oldFeeManager', ethereum.Value.fromAddress(oldFeeManager)),
    );
    swapFeeManagerChangedEvent.parameters.push(
        new ethereum.EventParam('newFeeManager', ethereum.Value.fromAddress(newFeeManager)),
    );

    return swapFeeManagerChangedEvent;
}

export function createSwapFeeModuleChangedEvent(oldFeeModule: Address, newFeeModule: Address): SwapFeeModuleChanged {
    let swapFeeModuleChangedEvent = changetype<SwapFeeModuleChanged>(newMockEvent());

    swapFeeModuleChangedEvent.parameters = new Array();

    swapFeeModuleChangedEvent.parameters.push(
        new ethereum.EventParam('oldFeeModule', ethereum.Value.fromAddress(oldFeeModule)),
    );
    swapFeeModuleChangedEvent.parameters.push(
        new ethereum.EventParam('newFeeModule', ethereum.Value.fromAddress(newFeeModule)),
    );

    return swapFeeModuleChangedEvent;
}

export function createTickSpacingEnabledEvent(tickSpacing: i32, fee: i32): TickSpacingEnabled {
    let tickSpacingEnabledEvent = changetype<TickSpacingEnabled>(newMockEvent());

    tickSpacingEnabledEvent.parameters = new Array();

    tickSpacingEnabledEvent.parameters.push(
        new ethereum.EventParam('tickSpacing', ethereum.Value.fromI32(tickSpacing)),
    );
    tickSpacingEnabledEvent.parameters.push(
        new ethereum.EventParam('fee', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(fee))),
    );

    return tickSpacingEnabledEvent;
}

export function createUnstakedFeeManagerChangedEvent(
    oldFeeManager: Address,
    newFeeManager: Address,
): UnstakedFeeManagerChanged {
    let unstakedFeeManagerChangedEvent = changetype<UnstakedFeeManagerChanged>(newMockEvent());

    unstakedFeeManagerChangedEvent.parameters = new Array();

    unstakedFeeManagerChangedEvent.parameters.push(
        new ethereum.EventParam('oldFeeManager', ethereum.Value.fromAddress(oldFeeManager)),
    );
    unstakedFeeManagerChangedEvent.parameters.push(
        new ethereum.EventParam('newFeeManager', ethereum.Value.fromAddress(newFeeManager)),
    );

    return unstakedFeeManagerChangedEvent;
}

export function createUnstakedFeeModuleChangedEvent(
    oldFeeModule: Address,
    newFeeModule: Address,
): UnstakedFeeModuleChanged {
    let unstakedFeeModuleChangedEvent = changetype<UnstakedFeeModuleChanged>(newMockEvent());

    unstakedFeeModuleChangedEvent.parameters = new Array();

    unstakedFeeModuleChangedEvent.parameters.push(
        new ethereum.EventParam('oldFeeModule', ethereum.Value.fromAddress(oldFeeModule)),
    );
    unstakedFeeModuleChangedEvent.parameters.push(
        new ethereum.EventParam('newFeeModule', ethereum.Value.fromAddress(newFeeModule)),
    );

    return unstakedFeeModuleChangedEvent;
}
