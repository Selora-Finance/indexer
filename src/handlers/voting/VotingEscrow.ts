import { VotingEscrow } from 'generated';
import { deriveId } from '../../utils/misc';
import { getAddress, zeroAddress } from 'viem';
import { BD_ZERO, BI_ZERO, LOCK_MAX_TIME, WEEK } from '../../utils/constants';
import { LockPosition_t } from 'generated/src/db/Entities.gen';
import { divideByBase } from '../../utils/math';

VotingEscrow.Transfer.handler(async ({ event, context }) => {
    const recipient = getAddress(event.params.to);
    const tokenId = event.params.tokenId;

    const _lockId = deriveId(tokenId.toString(), event.chainId);
    const _recipientId = deriveId(recipient, event.chainId);

    let lock = await context.LockPosition.get(_lockId);
    let rUser = await context.User.get(_recipientId);

    if (!rUser) {
        rUser = {
            id: _recipientId,
            address: recipient,
        };

        context.User.set(rUser);
    }

    if (!lock) {
        lock = {
            id: _lockId,
            lockId: tokenId,
            lockType: 'NORMAL',
            freeRewardManager: undefined,
            lockRewardManager: undefined,
            owner_id: zeroAddress,
            chainId: event.chainId,
            permanent: false,
            creationTransaction: event.transaction.hash,
            creationBlock: BigInt(event.block.number),
            position: BD_ZERO,
            unlockTime: BI_ZERO,
            totalVoteWeightGiven: BD_ZERO,
        };
    }

    lock = { ...lock, owner_id: rUser.id };
    context.LockPosition.set(lock);
});

VotingEscrow.Deposit.handlerWithLoader({
    loader: async ({ event, context }) => {
        const lockId = deriveId(event.params.tokenId.toString(), event.chainId);
        const lock = (await context.LockPosition.get(lockId)) as LockPosition_t;
        return { lock };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { lock } = loaderReturn;
        const amount = divideByBase(event.params.value);
        lock = { ...lock, position: lock.position.plus(amount), unlockTime: event.params.locktime };
        context.LockPosition.set(lock);
    },
});

VotingEscrow.Withdraw.handlerWithLoader({
    loader: async ({ event, context }) => {
        const lockId = deriveId(event.params.tokenId.toString(), event.chainId);
        const lock = (await context.LockPosition.get(lockId)) as LockPosition_t;
        return { lock };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { lock } = loaderReturn;
        const amount = divideByBase(event.params.value);
        lock = { ...lock, position: lock.position.minus(amount) };
        context.LockPosition.set(lock);
    },
});

VotingEscrow.DepositManaged.handlerWithLoader({
    loader: async ({ event, context }) => {
        const lockId = deriveId(event.params._tokenId.toString(), event.chainId);
        const mLockId = deriveId(event.params._mTokenId.toString(), event.chainId);
        const lock = (await context.LockPosition.get(lockId)) as LockPosition_t;
        const mLock = (await context.LockPosition.get(mLockId)) as LockPosition_t;
        return { lock, mLock };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { lock, mLock } = loaderReturn;
        const amount = divideByBase(event.params._weight);
        lock = { ...lock, position: lock.position.minus(amount) };
        mLock = { ...mLock, position: lock.position.plus(amount) };
        context.LockPosition.set(lock);
        context.LockPosition.set(mLock);
    },
});

VotingEscrow.CreateManaged.handlerWithLoader({
    loader: async ({ event, context }) => {
        const lockId = deriveId(event.params._mTokenId.toString(), event.chainId);
        const lock = (await context.LockPosition.get(lockId)) as LockPosition_t;
        return { lock };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { lock } = loaderReturn;
        const freeRewardManager = getAddress(event.params._freeManagedReward);
        const lockRewardManager = getAddress(event.params._lockedManagedReward);
        lock = { ...lock, freeRewardManager, lockRewardManager, lockType: 'MANAGED' };
        context.LockPosition.set(lock);
    },
});

VotingEscrow.WithdrawManaged.handlerWithLoader({
    loader: async ({ event, context }) => {
        const lockId = deriveId(event.params._tokenId.toString(), event.chainId);
        const mLockId = deriveId(event.params._mTokenId.toString(), event.chainId);
        const lock = (await context.LockPosition.get(lockId)) as LockPosition_t;
        const mLock = (await context.LockPosition.get(mLockId)) as LockPosition_t;
        return { lock, mLock };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { lock, mLock } = loaderReturn;
        const amount = divideByBase(event.params._weight);

        lock = { ...lock, position: amount };
        context.LockPosition.set(lock);

        if (amount < mLock.position) {
            mLock = { ...mLock, position: amount };
            context.LockPosition.set(mLock);
        }
    },
});

VotingEscrow.Merge.handlerWithLoader({
    loader: async ({ event, context }) => {
        const fromLockId = deriveId(event.params._from.toString(), event.chainId);
        const toLockId = deriveId(event.params._to.toString(), event.chainId);
        const fromLock = (await context.LockPosition.get(fromLockId)) as LockPosition_t;
        const toLock = (await context.LockPosition.get(toLockId)) as LockPosition_t;
        return { fromLock, toLock };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { fromLock, toLock } = loaderReturn;
        const amountFrom = divideByBase(event.params._amountFrom);
        const amountTo = divideByBase(event.params._amountTo);
        const amountTotal = amountFrom.plus(amountTo);
        fromLock = { ...fromLock, position: fromLock.position.minus(amountFrom) };
        context.LockPosition.set(fromLock);
        toLock = { ...toLock, position: amountTotal };
        context.LockPosition.set(toLock);
    },
});

VotingEscrow.Split.handlerWithLoader({
    loader: async ({ event, context }) => {
        const fromLockId = deriveId(event.params._from.toString(), event.chainId);
        const lock1Id = deriveId(event.params._tokenId1.toString(), event.chainId);
        const lock2Id = deriveId(event.params._tokenId2.toString(), event.chainId);
        const fromLock = (await context.LockPosition.get(fromLockId)) as LockPosition_t;
        const lock1 = (await context.LockPosition.get(lock1Id)) as LockPosition_t;
        const lock2 = (await context.LockPosition.get(lock2Id)) as LockPosition_t;
        return { fromLock, lock1, lock2 };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { fromLock, lock1, lock2 } = loaderReturn;
        const amount1 = divideByBase(event.params._splitAmount1);
        const amount2 = divideByBase(event.params._splitAmount2);
        fromLock = { ...fromLock, permanent: false, position: BD_ZERO, unlockTime: BI_ZERO };
        context.LockPosition.set(fromLock);
        lock1 = { ...lock1, position: amount1, unlockTime: event.params._locktime };
        context.LockPosition.set(lock1);
        lock2 = { ...lock2, position: amount2, unlockTime: event.params._locktime };
        context.LockPosition.set(lock2);
    },
});

VotingEscrow.LockPermanent.handler(async ({ event, context }) => {
    const lockId = deriveId(event.params._tokenId.toString(), event.chainId);
    let lock = (await context.LockPosition.get(lockId)) as LockPosition_t;
    lock = { ...lock, permanent: true, unlockTime: BI_ZERO };
    context.LockPosition.set(lock);
});

VotingEscrow.UnlockPermanent.handler(async ({ event, context }) => {
    const lockId = deriveId(event.params._tokenId.toString(), event.chainId);
    let lock = (await context.LockPosition.get(lockId)) as LockPosition_t;
    const unlockTime = ((event.params._ts + LOCK_MAX_TIME) / WEEK) * WEEK;
    lock = { ...lock, permanent: false, unlockTime };
    context.LockPosition.set(lock);
});
