import { newMockEvent } from 'matchstick-as';
import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts';
import {
    Approval,
    ApprovalForAll,
    BatchMetadataUpdate,
    Collect,
    DecreaseLiquidity,
    IncreaseLiquidity,
    MetadataUpdate,
    TokenDescriptorChanged,
    Transfer,
    TransferOwnership,
} from '../generated/NonfungiblePositionManager/NonfungiblePositionManager';

export function createApprovalEvent(owner: Address, approved: Address, tokenId: BigInt): Approval {
    let approvalEvent = changetype<Approval>(newMockEvent());

    approvalEvent.parameters = new Array();

    approvalEvent.parameters.push(new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner)));
    approvalEvent.parameters.push(new ethereum.EventParam('approved', ethereum.Value.fromAddress(approved)));
    approvalEvent.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)));

    return approvalEvent;
}

export function createApprovalForAllEvent(owner: Address, operator: Address, approved: boolean): ApprovalForAll {
    let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent());

    approvalForAllEvent.parameters = new Array();

    approvalForAllEvent.parameters.push(new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner)));
    approvalForAllEvent.parameters.push(new ethereum.EventParam('operator', ethereum.Value.fromAddress(operator)));
    approvalForAllEvent.parameters.push(new ethereum.EventParam('approved', ethereum.Value.fromBoolean(approved)));

    return approvalForAllEvent;
}

export function createBatchMetadataUpdateEvent(_fromTokenId: BigInt, _toTokenId: BigInt): BatchMetadataUpdate {
    let batchMetadataUpdateEvent = changetype<BatchMetadataUpdate>(newMockEvent());

    batchMetadataUpdateEvent.parameters = new Array();

    batchMetadataUpdateEvent.parameters.push(
        new ethereum.EventParam('_fromTokenId', ethereum.Value.fromUnsignedBigInt(_fromTokenId)),
    );
    batchMetadataUpdateEvent.parameters.push(
        new ethereum.EventParam('_toTokenId', ethereum.Value.fromUnsignedBigInt(_toTokenId)),
    );

    return batchMetadataUpdateEvent;
}

export function createCollectEvent(tokenId: BigInt, recipient: Address, amount0: BigInt, amount1: BigInt): Collect {
    let collectEvent = changetype<Collect>(newMockEvent());

    collectEvent.parameters = new Array();

    collectEvent.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)));
    collectEvent.parameters.push(new ethereum.EventParam('recipient', ethereum.Value.fromAddress(recipient)));
    collectEvent.parameters.push(new ethereum.EventParam('amount0', ethereum.Value.fromUnsignedBigInt(amount0)));
    collectEvent.parameters.push(new ethereum.EventParam('amount1', ethereum.Value.fromUnsignedBigInt(amount1)));

    return collectEvent;
}

export function createDecreaseLiquidityEvent(
    tokenId: BigInt,
    liquidity: BigInt,
    amount0: BigInt,
    amount1: BigInt,
): DecreaseLiquidity {
    let decreaseLiquidityEvent = changetype<DecreaseLiquidity>(newMockEvent());

    decreaseLiquidityEvent.parameters = new Array();

    decreaseLiquidityEvent.parameters.push(
        new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)),
    );
    decreaseLiquidityEvent.parameters.push(
        new ethereum.EventParam('liquidity', ethereum.Value.fromUnsignedBigInt(liquidity)),
    );
    decreaseLiquidityEvent.parameters.push(
        new ethereum.EventParam('amount0', ethereum.Value.fromUnsignedBigInt(amount0)),
    );
    decreaseLiquidityEvent.parameters.push(
        new ethereum.EventParam('amount1', ethereum.Value.fromUnsignedBigInt(amount1)),
    );

    return decreaseLiquidityEvent;
}

export function createIncreaseLiquidityEvent(
    tokenId: BigInt,
    liquidity: BigInt,
    amount0: BigInt,
    amount1: BigInt,
): IncreaseLiquidity {
    let increaseLiquidityEvent = changetype<IncreaseLiquidity>(newMockEvent());

    increaseLiquidityEvent.parameters = new Array();

    increaseLiquidityEvent.parameters.push(
        new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)),
    );
    increaseLiquidityEvent.parameters.push(
        new ethereum.EventParam('liquidity', ethereum.Value.fromUnsignedBigInt(liquidity)),
    );
    increaseLiquidityEvent.parameters.push(
        new ethereum.EventParam('amount0', ethereum.Value.fromUnsignedBigInt(amount0)),
    );
    increaseLiquidityEvent.parameters.push(
        new ethereum.EventParam('amount1', ethereum.Value.fromUnsignedBigInt(amount1)),
    );

    return increaseLiquidityEvent;
}

export function createMetadataUpdateEvent(_tokenId: BigInt): MetadataUpdate {
    let metadataUpdateEvent = changetype<MetadataUpdate>(newMockEvent());

    metadataUpdateEvent.parameters = new Array();

    metadataUpdateEvent.parameters.push(
        new ethereum.EventParam('_tokenId', ethereum.Value.fromUnsignedBigInt(_tokenId)),
    );

    return metadataUpdateEvent;
}

export function createTokenDescriptorChangedEvent(tokenDescriptor: Address): TokenDescriptorChanged {
    let tokenDescriptorChangedEvent = changetype<TokenDescriptorChanged>(newMockEvent());

    tokenDescriptorChangedEvent.parameters = new Array();

    tokenDescriptorChangedEvent.parameters.push(
        new ethereum.EventParam('tokenDescriptor', ethereum.Value.fromAddress(tokenDescriptor)),
    );

    return tokenDescriptorChangedEvent;
}

export function createTransferEvent(from: Address, to: Address, tokenId: BigInt): Transfer {
    let transferEvent = changetype<Transfer>(newMockEvent());

    transferEvent.parameters = new Array();

    transferEvent.parameters.push(new ethereum.EventParam('from', ethereum.Value.fromAddress(from)));
    transferEvent.parameters.push(new ethereum.EventParam('to', ethereum.Value.fromAddress(to)));
    transferEvent.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)));

    return transferEvent;
}

export function createTransferOwnershipEvent(owner: Address): TransferOwnership {
    let transferOwnershipEvent = changetype<TransferOwnership>(newMockEvent());

    transferOwnershipEvent.parameters = new Array();

    transferOwnershipEvent.parameters.push(new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner)));

    return transferOwnershipEvent;
}
