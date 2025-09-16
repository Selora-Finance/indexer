import { Voter } from 'generated';
import { Gauge_t, LockPosition_t, Pool_t } from 'generated/src/db/Entities.gen';
import { getGeneratedByChainId } from 'generated/src/ConfigYAML.gen';
import { getAddress } from 'viem';
import { BD_ZERO, BI_ZERO } from '../../utils/constants';
import { Gauge as OnchainGauge } from '../../utils/onchain/gauge';
import { loadTokenDetails } from '../../utils/loaders';
import { deriveId } from '../../utils/misc';
import { divideByBase } from '../../utils/math';

Voter.GaugeCreated.contractRegister(
    ({ event, context }) => {
        const configuration = getGeneratedByChainId(event.chainId);
        const v2PoolFactories = configuration.contracts.PoolFactory.addresses.map((address) => address.toLowerCase());
        if (v2PoolFactories.includes(event.params.poolFactory.toLowerCase())) {
            context.addGauge(event.params.gauge);
        } else {
            context.addCLGauge(event.params.gauge);
        }
        context.addVotingReward(event.params.feeVotingReward);
        context.addVotingReward(event.params.bribeVotingReward);
    },
    { preRegisterDynamicContracts: true },
);

Voter.GaugeCreated.handlerWithLoader({
    loader: async ({ event, context }) => {
        const poolAddress = getAddress(event.params.pool);
        const poolId = deriveId(poolAddress, event.chainId);
        const pool = await context.Pool.get(poolId);
        return { pool };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { pool } = loaderReturn;
        if (!pool) return;
        const gaugeAddress = getAddress(event.params.gauge);
        const gaugeId = deriveId(gaugeAddress, event.chainId);
        let rewardToken = await OnchainGauge.init(event.chainId, gaugeAddress).rewardToken();
        if (!rewardToken) return;
        rewardToken = getAddress(rewardToken);
        const tokenId = deriveId(rewardToken, event.chainId);
        let token = await context.Token.get(tokenId);

        if (!token) {
            const _t = await loadTokenDetails(rewardToken, event.chainId);
            if (!_t) {
                context.log.error(`Could not fetch token details for ${rewardToken}`);
                return; // Must pass
            }
            token = {
                ..._t,
                chainId: event.chainId,
                address: rewardToken,
                derivedETH: BD_ZERO,
                derivedUSD: BD_ZERO,
                totalLiquidity: BD_ZERO,
                totalLiquidityUSD: BD_ZERO,
                txCount: BI_ZERO,
                tradeVolume: BD_ZERO,
                tradeVolumeUSD: BD_ZERO,
                totalLiquidityETH: BD_ZERO,
            };

            context.Token.set(token);
        }

        const gauge: Gauge_t = {
            id: gaugeId,
            isAlive: true,
            depositPool_id: pool.id,
            address: gaugeAddress,
            bribeVotingReward: event.params.bribeVotingReward,
            feeVotingReward: event.params.feeVotingReward,
            emission: BD_ZERO,
            fees0: BD_ZERO,
            fees1: BD_ZERO,
            rewardRate: BD_ZERO,
            rewardToken_id: token.id,
            totalSupply: BD_ZERO,
            chainId: event.chainId,
        };

        context.Gauge.set(gauge);

        pool = { ...pool, gauge_id: gauge.id };
        context.Pool.set(pool);
    },
});

Voter.GaugeKilled.handler(async ({ context, event }) => {
    const gaugeAddress = getAddress(event.params.gauge);
    const gaugeId = deriveId(gaugeAddress, event.chainId);
    let gauge = await context.Gauge.get(gaugeId);
    if (!gauge) return; // Gauge must exist
    gauge = { ...gauge, isAlive: false };
    context.Gauge.set(gauge);
});

Voter.GaugeRevived.handler(async ({ context, event }) => {
    const gaugeAddress = getAddress(event.params.gauge);
    const gaugeId = deriveId(gaugeAddress, event.chainId);
    let gauge = await context.Gauge.get(gaugeId);
    if (!gauge) return; // Gauge must exist
    gauge = { ...gauge, isAlive: true };
    context.Gauge.set(gauge);
});

Voter.Voted.handlerWithLoader({
    loader: async ({ event, context }) => {
        const lockId = deriveId(event.params.tokenId.toString(), event.chainId);
        const poolAddress = getAddress(event.params.pool);
        const poolId = deriveId(poolAddress, event.chainId);
        const lock = (await context.LockPosition.get(lockId)) as LockPosition_t;
        const pool = (await context.Pool.get(poolId)) as Pool_t;
        return { lock, pool };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { lock, pool } = loaderReturn;
        const weight = divideByBase(event.params.weight);
        pool = { ...pool, totalVotes: pool.totalVotes.plus(weight) };
        lock = { ...lock, totalVoteWeightGiven: lock.totalVoteWeightGiven.plus(weight) };
        context.Pool.set(pool);
        context.LockPosition.set(lock);
    },
});
