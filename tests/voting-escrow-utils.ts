import { newMockEvent } from 'matchstick-as';
import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts';
import {
    Approval,
    ApprovalForAll,
    BatchMetadataUpdate,
    CreateManaged,
    DelegateChanged,
    DelegateVotesChanged,
    Deposit,
    DepositManaged,
    LockPermanent,
    Merge,
    MetadataUpdate,
    SetAllowedManager,
    Split,
    Supply,
    Transfer,
    UnlockPermanent,
    Withdraw,
    WithdrawManaged,
} from '../generated/VotingEscrow/VotingEscrow';

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

export function createCreateManagedEvent(
    _to: Address,
    _mTokenId: BigInt,
    _from: Address,
    _lockedManagedReward: Address,
    _freeManagedReward: Address,
): CreateManaged {
    let createManagedEvent = changetype<CreateManaged>(newMockEvent());

    createManagedEvent.parameters = new Array();

    createManagedEvent.parameters.push(new ethereum.EventParam('_to', ethereum.Value.fromAddress(_to)));
    createManagedEvent.parameters.push(
        new ethereum.EventParam('_mTokenId', ethereum.Value.fromUnsignedBigInt(_mTokenId)),
    );
    createManagedEvent.parameters.push(new ethereum.EventParam('_from', ethereum.Value.fromAddress(_from)));
    createManagedEvent.parameters.push(
        new ethereum.EventParam('_lockedManagedReward', ethereum.Value.fromAddress(_lockedManagedReward)),
    );
    createManagedEvent.parameters.push(
        new ethereum.EventParam('_freeManagedReward', ethereum.Value.fromAddress(_freeManagedReward)),
    );

    return createManagedEvent;
}

export function createDelegateChangedEvent(
    delegator: Address,
    fromDelegate: BigInt,
    toDelegate: BigInt,
): DelegateChanged {
    let delegateChangedEvent = changetype<DelegateChanged>(newMockEvent());

    delegateChangedEvent.parameters = new Array();

    delegateChangedEvent.parameters.push(new ethereum.EventParam('delegator', ethereum.Value.fromAddress(delegator)));
    delegateChangedEvent.parameters.push(
        new ethereum.EventParam('fromDelegate', ethereum.Value.fromUnsignedBigInt(fromDelegate)),
    );
    delegateChangedEvent.parameters.push(
        new ethereum.EventParam('toDelegate', ethereum.Value.fromUnsignedBigInt(toDelegate)),
    );

    return delegateChangedEvent;
}

export function createDelegateVotesChangedEvent(
    delegate: Address,
    previousBalance: BigInt,
    newBalance: BigInt,
): DelegateVotesChanged {
    let delegateVotesChangedEvent = changetype<DelegateVotesChanged>(newMockEvent());

    delegateVotesChangedEvent.parameters = new Array();

    delegateVotesChangedEvent.parameters.push(
        new ethereum.EventParam('delegate', ethereum.Value.fromAddress(delegate)),
    );
    delegateVotesChangedEvent.parameters.push(
        new ethereum.EventParam('previousBalance', ethereum.Value.fromUnsignedBigInt(previousBalance)),
    );
    delegateVotesChangedEvent.parameters.push(
        new ethereum.EventParam('newBalance', ethereum.Value.fromUnsignedBigInt(newBalance)),
    );

    return delegateVotesChangedEvent;
}

export function createDepositEvent(
    provider: Address,
    tokenId: BigInt,
    depositType: i32,
    value: BigInt,
    locktime: BigInt,
    ts: BigInt,
): Deposit {
    let depositEvent = changetype<Deposit>(newMockEvent());

    depositEvent.parameters = new Array();

    depositEvent.parameters.push(new ethereum.EventParam('provider', ethereum.Value.fromAddress(provider)));
    depositEvent.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)));
    depositEvent.parameters.push(
        new ethereum.EventParam('depositType', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(depositType))),
    );
    depositEvent.parameters.push(new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value)));
    depositEvent.parameters.push(new ethereum.EventParam('locktime', ethereum.Value.fromUnsignedBigInt(locktime)));
    depositEvent.parameters.push(new ethereum.EventParam('ts', ethereum.Value.fromUnsignedBigInt(ts)));

    return depositEvent;
}

export function createDepositManagedEvent(
    _owner: Address,
    _tokenId: BigInt,
    _mTokenId: BigInt,
    _weight: BigInt,
    _ts: BigInt,
): DepositManaged {
    let depositManagedEvent = changetype<DepositManaged>(newMockEvent());

    depositManagedEvent.parameters = new Array();

    depositManagedEvent.parameters.push(new ethereum.EventParam('_owner', ethereum.Value.fromAddress(_owner)));
    depositManagedEvent.parameters.push(
        new ethereum.EventParam('_tokenId', ethereum.Value.fromUnsignedBigInt(_tokenId)),
    );
    depositManagedEvent.parameters.push(
        new ethereum.EventParam('_mTokenId', ethereum.Value.fromUnsignedBigInt(_mTokenId)),
    );
    depositManagedEvent.parameters.push(new ethereum.EventParam('_weight', ethereum.Value.fromUnsignedBigInt(_weight)));
    depositManagedEvent.parameters.push(new ethereum.EventParam('_ts', ethereum.Value.fromUnsignedBigInt(_ts)));

    return depositManagedEvent;
}

export function createLockPermanentEvent(
    _owner: Address,
    _tokenId: BigInt,
    amount: BigInt,
    _ts: BigInt,
): LockPermanent {
    let lockPermanentEvent = changetype<LockPermanent>(newMockEvent());

    lockPermanentEvent.parameters = new Array();

    lockPermanentEvent.parameters.push(new ethereum.EventParam('_owner', ethereum.Value.fromAddress(_owner)));
    lockPermanentEvent.parameters.push(
        new ethereum.EventParam('_tokenId', ethereum.Value.fromUnsignedBigInt(_tokenId)),
    );
    lockPermanentEvent.parameters.push(new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)));
    lockPermanentEvent.parameters.push(new ethereum.EventParam('_ts', ethereum.Value.fromUnsignedBigInt(_ts)));

    return lockPermanentEvent;
}

export function createMergeEvent(
    _sender: Address,
    _from: BigInt,
    _to: BigInt,
    _amountFrom: BigInt,
    _amountTo: BigInt,
    _amountFinal: BigInt,
    _locktime: BigInt,
    _ts: BigInt,
): Merge {
    let mergeEvent = changetype<Merge>(newMockEvent());

    mergeEvent.parameters = new Array();

    mergeEvent.parameters.push(new ethereum.EventParam('_sender', ethereum.Value.fromAddress(_sender)));
    mergeEvent.parameters.push(new ethereum.EventParam('_from', ethereum.Value.fromUnsignedBigInt(_from)));
    mergeEvent.parameters.push(new ethereum.EventParam('_to', ethereum.Value.fromUnsignedBigInt(_to)));
    mergeEvent.parameters.push(new ethereum.EventParam('_amountFrom', ethereum.Value.fromUnsignedBigInt(_amountFrom)));
    mergeEvent.parameters.push(new ethereum.EventParam('_amountTo', ethereum.Value.fromUnsignedBigInt(_amountTo)));
    mergeEvent.parameters.push(
        new ethereum.EventParam('_amountFinal', ethereum.Value.fromUnsignedBigInt(_amountFinal)),
    );
    mergeEvent.parameters.push(new ethereum.EventParam('_locktime', ethereum.Value.fromUnsignedBigInt(_locktime)));
    mergeEvent.parameters.push(new ethereum.EventParam('_ts', ethereum.Value.fromUnsignedBigInt(_ts)));

    return mergeEvent;
}

export function createMetadataUpdateEvent(_tokenId: BigInt): MetadataUpdate {
    let metadataUpdateEvent = changetype<MetadataUpdate>(newMockEvent());

    metadataUpdateEvent.parameters = new Array();

    metadataUpdateEvent.parameters.push(
        new ethereum.EventParam('_tokenId', ethereum.Value.fromUnsignedBigInt(_tokenId)),
    );

    return metadataUpdateEvent;
}

export function createSetAllowedManagerEvent(_allowedManager: Address): SetAllowedManager {
    let setAllowedManagerEvent = changetype<SetAllowedManager>(newMockEvent());

    setAllowedManagerEvent.parameters = new Array();

    setAllowedManagerEvent.parameters.push(
        new ethereum.EventParam('_allowedManager', ethereum.Value.fromAddress(_allowedManager)),
    );

    return setAllowedManagerEvent;
}

export function createSplitEvent(
    _from: BigInt,
    _tokenId1: BigInt,
    _tokenId2: BigInt,
    _sender: Address,
    _splitAmount1: BigInt,
    _splitAmount2: BigInt,
    _locktime: BigInt,
    _ts: BigInt,
): Split {
    let splitEvent = changetype<Split>(newMockEvent());

    splitEvent.parameters = new Array();

    splitEvent.parameters.push(new ethereum.EventParam('_from', ethereum.Value.fromUnsignedBigInt(_from)));
    splitEvent.parameters.push(new ethereum.EventParam('_tokenId1', ethereum.Value.fromUnsignedBigInt(_tokenId1)));
    splitEvent.parameters.push(new ethereum.EventParam('_tokenId2', ethereum.Value.fromUnsignedBigInt(_tokenId2)));
    splitEvent.parameters.push(new ethereum.EventParam('_sender', ethereum.Value.fromAddress(_sender)));
    splitEvent.parameters.push(
        new ethereum.EventParam('_splitAmount1', ethereum.Value.fromUnsignedBigInt(_splitAmount1)),
    );
    splitEvent.parameters.push(
        new ethereum.EventParam('_splitAmount2', ethereum.Value.fromUnsignedBigInt(_splitAmount2)),
    );
    splitEvent.parameters.push(new ethereum.EventParam('_locktime', ethereum.Value.fromUnsignedBigInt(_locktime)));
    splitEvent.parameters.push(new ethereum.EventParam('_ts', ethereum.Value.fromUnsignedBigInt(_ts)));

    return splitEvent;
}

export function createSupplyEvent(prevSupply: BigInt, supply: BigInt): Supply {
    let supplyEvent = changetype<Supply>(newMockEvent());

    supplyEvent.parameters = new Array();

    supplyEvent.parameters.push(new ethereum.EventParam('prevSupply', ethereum.Value.fromUnsignedBigInt(prevSupply)));
    supplyEvent.parameters.push(new ethereum.EventParam('supply', ethereum.Value.fromUnsignedBigInt(supply)));

    return supplyEvent;
}

export function createTransferEvent(from: Address, to: Address, tokenId: BigInt): Transfer {
    let transferEvent = changetype<Transfer>(newMockEvent());

    transferEvent.parameters = new Array();

    transferEvent.parameters.push(new ethereum.EventParam('from', ethereum.Value.fromAddress(from)));
    transferEvent.parameters.push(new ethereum.EventParam('to', ethereum.Value.fromAddress(to)));
    transferEvent.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)));

    return transferEvent;
}

export function createUnlockPermanentEvent(
    _owner: Address,
    _tokenId: BigInt,
    amount: BigInt,
    _ts: BigInt,
): UnlockPermanent {
    let unlockPermanentEvent = changetype<UnlockPermanent>(newMockEvent());

    unlockPermanentEvent.parameters = new Array();

    unlockPermanentEvent.parameters.push(new ethereum.EventParam('_owner', ethereum.Value.fromAddress(_owner)));
    unlockPermanentEvent.parameters.push(
        new ethereum.EventParam('_tokenId', ethereum.Value.fromUnsignedBigInt(_tokenId)),
    );
    unlockPermanentEvent.parameters.push(new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)));
    unlockPermanentEvent.parameters.push(new ethereum.EventParam('_ts', ethereum.Value.fromUnsignedBigInt(_ts)));

    return unlockPermanentEvent;
}

export function createWithdrawEvent(provider: Address, tokenId: BigInt, value: BigInt, ts: BigInt): Withdraw {
    let withdrawEvent = changetype<Withdraw>(newMockEvent());

    withdrawEvent.parameters = new Array();

    withdrawEvent.parameters.push(new ethereum.EventParam('provider', ethereum.Value.fromAddress(provider)));
    withdrawEvent.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)));
    withdrawEvent.parameters.push(new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value)));
    withdrawEvent.parameters.push(new ethereum.EventParam('ts', ethereum.Value.fromUnsignedBigInt(ts)));

    return withdrawEvent;
}

export function createWithdrawManagedEvent(
    _owner: Address,
    _tokenId: BigInt,
    _mTokenId: BigInt,
    _weight: BigInt,
    _ts: BigInt,
): WithdrawManaged {
    let withdrawManagedEvent = changetype<WithdrawManaged>(newMockEvent());

    withdrawManagedEvent.parameters = new Array();

    withdrawManagedEvent.parameters.push(new ethereum.EventParam('_owner', ethereum.Value.fromAddress(_owner)));
    withdrawManagedEvent.parameters.push(
        new ethereum.EventParam('_tokenId', ethereum.Value.fromUnsignedBigInt(_tokenId)),
    );
    withdrawManagedEvent.parameters.push(
        new ethereum.EventParam('_mTokenId', ethereum.Value.fromUnsignedBigInt(_mTokenId)),
    );
    withdrawManagedEvent.parameters.push(
        new ethereum.EventParam('_weight', ethereum.Value.fromUnsignedBigInt(_weight)),
    );
    withdrawManagedEvent.parameters.push(new ethereum.EventParam('_ts', ethereum.Value.fromUnsignedBigInt(_ts)));

    return withdrawManagedEvent;
}
