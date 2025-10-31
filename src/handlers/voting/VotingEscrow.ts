import {
    Transfer as TransferEvent,
    Deposit as DepositEvent,
    Withdraw as WithdrawEvent,
    DepositManaged as DepositManagedEvent,
    CreateManaged as CreateManagedEvent,
    WithdrawManaged as WithdrawManagedEvent,
    Merge as MergeEvent,
    Split as SplitEvent,
    UnlockPermanent as UnlockPermanentEvent,
    LockPermanent as LockPermanentEvent,
} from '../../../generated/VotingEscrow/VotingEscrow';
import { LockPosition, User } from '../../../generated/schema';
import { BD_ZERO, BI_ZERO, LOCK_MAX_TIME, WEEK, ZERO_ADDRESS } from '../../utils/constants';
import { divideByBase } from '../../utils/math';

export function handleTransfer(event: TransferEvent): void {
    const recipient = event.params.to;
    const tokenId = event.params.tokenId;
    let lock = LockPosition.load(tokenId.toString());
    let user = User.load(recipient.toHex());

    if (user == null) {
        user = new User(recipient.toHex());
        user.address = recipient;
        user.save();
    }

    if (lock == null) {
        lock = new LockPosition(tokenId.toString());
        lock.lockId = tokenId;
        lock.lockType = 'NORMAL';
        lock.freeRewardManager = null;
        lock.lockRewardManager = null;
        lock.owner = ZERO_ADDRESS;
        lock.permanent = false;
        lock.creationTransaction = event.transaction.hash;
        lock.creationBlock = event.block.number;
        lock.position = BD_ZERO;
        lock.unlockTime = BI_ZERO;
        lock.totalVoteWeightGiven = BD_ZERO;
    }

    lock.owner = user.id;
    lock.save();
}

export function handleDeposit(event: DepositEvent): void {
    const tokenId = event.params.tokenId;
    const lock = LockPosition.load(tokenId.toString()) as LockPosition;
    const amount = divideByBase(event.params.value);
    lock.position = lock.position.plus(amount);
    lock.unlockTime = lock.unlockTime;
    lock.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
    const tokenId = event.params.tokenId;
    const lock = LockPosition.load(tokenId.toString()) as LockPosition;
    const amount = divideByBase(event.params.value);
    lock.position = lock.position.minus(amount);
    lock.unlockTime = lock.unlockTime;
    lock.save();
}

export function handleDepositManaged(event: DepositManagedEvent): void {
    const lockId = event.params._tokenId;
    const mLockId = event.params._mTokenId;
    const lock = LockPosition.load(lockId.toString()) as LockPosition;
    const mLock = LockPosition.load(mLockId.toString()) as LockPosition;
    const amount = divideByBase(event.params._weight);
    lock.position = lock.position.minus(amount);
    mLock.position = mLock.position.plus(amount);
    lock.save();
    mLock.save();
}

export function handleCreateManaged(event: CreateManagedEvent): void {
    const lockId = event.params._mTokenId;
    const lock = LockPosition.load(lockId.toString()) as LockPosition;
    lock.freeRewardManager = event.params._freeManagedReward;
    lock.lockRewardManager = event.params._lockedManagedReward;
    lock.lockType = 'MANAGED';
    lock.save();
}

export function handleWithdrawManaged(event: WithdrawManagedEvent): void {
    const lockId = event.params._tokenId;
    const mLockId = event.params._mTokenId;
    const lock = LockPosition.load(lockId.toString()) as LockPosition;
    const mLock = LockPosition.load(mLockId.toString()) as LockPosition;
    const amount = divideByBase(event.params._weight);
    lock.position = amount;
    lock.save();

    if (amount.lt(mLock.position)) {
        mLock.position = amount;
        mLock.save();
    }
}

export function handleMerge(event: MergeEvent): void {
    const fromLockId = event.params._from;
    const toLockId = event.params._to;
    const fromLock = LockPosition.load(fromLockId.toString()) as LockPosition;
    const toLock = LockPosition.load(toLockId.toString()) as LockPosition;
    const amountFrom = divideByBase(event.params._amountFrom);
    const amountTo = divideByBase(event.params._amountTo);
    const amountTotal = amountFrom.plus(amountTo);
    fromLock.position = fromLock.position.minus(amountFrom);
    fromLock.save();
    toLock.position = amountTotal;
    toLock.save();
}

export function handleSplit(event: SplitEvent): void {
    const fromLockId = event.params._from;
    const lock1Id = event.params._tokenId1;
    const lock2Id = event.params._tokenId2;
    const fromLock = LockPosition.load(fromLockId.toString()) as LockPosition;
    const lock1 = LockPosition.load(lock1Id.toString()) as LockPosition;
    const lock2 = LockPosition.load(lock2Id.toString()) as LockPosition;
    const amount1 = divideByBase(event.params._splitAmount1);
    const amount2 = divideByBase(event.params._splitAmount2);
    fromLock.permanent = false;
    fromLock.position = BD_ZERO;
    fromLock.unlockTime = BI_ZERO;
    fromLock.save();

    lock1.position = amount1;
    lock1.unlockTime = event.params._locktime;
    lock1.save();

    lock2.position = amount2;
    lock2.unlockTime = event.params._locktime;
    lock2.save();
}

export function handleLockPermanent(event: LockPermanentEvent): void {
    const lockId = event.params._tokenId;
    const lock = LockPosition.load(lockId.toString()) as LockPosition;
    lock.permanent = true;
    lock.unlockTime = BI_ZERO;
    lock.save();
}

export function handleUnlockPermanent(event: UnlockPermanentEvent): void {
    const lockId = event.params._tokenId;
    const lock = LockPosition.load(lockId.toString()) as LockPosition;
    lock.permanent = false;
    lock.unlockTime = event.params._ts.plus(LOCK_MAX_TIME).div(WEEK).times(WEEK);
    lock.save();
}
