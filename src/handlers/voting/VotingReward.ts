import { VotingReward } from 'generated';
import { Pool_t, Statistics_t } from 'generated/src/db/Entities.gen';
import { deriveId } from '../../utils/misc';
import { loadTokenDetails, loadTokenPrices } from '../../utils/loaders';
import { BD_ZERO, BI_ZERO } from '../../utils/constants';
import { divideByBase } from '../../utils/math';
import { getAddress } from 'viem';

VotingReward.NotifyReward.handlerWithLoader({
    loader: async ({ event, context }) => {
        const gauges = await context.Gauge.getWhere.chainId.eq(event.chainId);
        const gauge = gauges.find(
            (g) =>
                g.feeVotingReward.toLowerCase() === event.srcAddress.toLowerCase() ||
                g.bribeVotingReward.toLowerCase() === event.srcAddress.toLowerCase(),
        );
        return { gauge };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { gauge } = loaderReturn;
        if (!gauge) return; // Gauge must not be undefined
        // Find pool associated with gauge
        let pool = (await context.Pool.get(gauge.depositPool_id)) as Pool_t;
        const tokenAddress = getAddress(event.params.reward);
        const tokenId = deriveId(tokenAddress, event.chainId);
        let token = await context.Token.get(tokenId);

        if (!token) {
            const _t = await loadTokenDetails(tokenAddress, event.chainId);
            if (!_t) {
                context.log.error(`Could not fetch token details for ${event.params.reward}`);
                return; // Must pass
            }
            token = {
                ..._t,
                chainId: event.chainId,
                address: tokenAddress,
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

        token = await loadTokenPrices(context, token, event.chainId);

        const amount = divideByBase(event.params.amount, token.decimals);
        const amountUSD = amount.times(token.derivedUSD);
        const amountETH = amount.times(token.derivedETH);
        const isFee = event.srcAddress.toLowerCase() === gauge.feeVotingReward.toLowerCase();
        const isCL = pool.poolType === 'CONCENTRATED';

        let statistics = (await context.Statistics.get(deriveId('1', event.chainId))) as Statistics_t;

        if (isFee) {
            const isToken0 = token.id === pool.token0_id;
            const reserve0 = isToken0 ? pool.reserve0.minus(amount) : pool.reserve0;
            const reserve1 = !isToken0 ? pool.reserve1.minus(amount) : pool.reserve1;
            const gaugeFees0CurrentEpoch = isToken0
                ? pool.gaugeFees0CurrentEpoch.plus(amount)
                : pool.gaugeFees0CurrentEpoch;
            const gaugeFees1CurrentEpoch = !isToken0
                ? pool.gaugeFees1CurrentEpoch.plus(amount)
                : pool.gaugeFees1CurrentEpoch;
            const gaugeFeesUSD = pool.gaugeFeesUSD.plus(amountUSD);
            const totalFees0 = isToken0 && isCL ? pool.totalFees0.plus(amount) : pool.totalFees0;
            const totalFees1 = !isToken0 && isCL ? pool.totalFees1.plus(amount) : pool.totalFees1;
            const totalFeesUSD = isCL ? pool.totalFeesUSD.plus(amountUSD) : pool.totalFeesUSD;

            pool = {
                ...pool,
                reserve0,
                reserve1,
                reserveUSD: pool.reserveUSD.minus(amountUSD),
                reserveETH: pool.reserveETH.minus(amountETH),
                gaugeFees0CurrentEpoch,
                gaugeFees1CurrentEpoch,
                gaugeFeesUSD,
                totalFees0,
                totalFees1,
                totalFeesUSD,
            };
            gauge = { ...gauge, fees0: gaugeFees0CurrentEpoch, fees1: gaugeFees1CurrentEpoch };

            if (isCL) {
                statistics = { ...statistics, totalFeesUSD: statistics.totalFeesUSD.plus(amountUSD) };
            }
        } else {
            // Is bribe
            const totalBribesUSD = pool.totalBribesUSD.plus(amountUSD);
            pool = { ...pool, totalBribesUSD };
            statistics = { ...statistics, totalBribesUSD: statistics.totalBribesUSD.plus(amountUSD) };
        }

        context.Pool.set(pool);
        context.Gauge.set(gauge);
        context.Statistics.set(statistics);
    },
});

VotingReward.ClaimRewards.handlerWithLoader({
    loader: async ({ event, context }) => {
        const tokenId = deriveId(getAddress(event.params.reward), event.chainId);
        const gauges = await context.Gauge.getWhere.chainId.eq(event.chainId);
        const token = await context.Token.get(tokenId);
        const gauge = gauges.find(
            (g) =>
                g.feeVotingReward.toLowerCase() === event.srcAddress.toLowerCase() ||
                g.bribeVotingReward.toLowerCase() === event.srcAddress.toLowerCase(),
        );

        return { gauge, token };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { gauge, token } = loaderReturn;
        if (!gauge || !token) return; // Must pass

        token = await loadTokenPrices(context, token, event.chainId);
        const isFee = event.srcAddress.toLowerCase() === gauge.feeVotingReward.toLowerCase();
        let pool = (await context.Pool.get(gauge.depositPool_id)) as Pool_t;
        let statistics = (await context.Statistics.get(deriveId('1', event.chainId))) as Statistics_t;

        const amount = divideByBase(event.params.amount, token.decimals);
        const amountUSD = amount.times(token.derivedUSD);
        // const amountETH = amount.times(token.derivedETH);

        if (isFee) {
            const isToken0 = token.id === pool.token0_id;
            const gaugeFees0CurrentEpoch = isToken0
                ? pool.gaugeFees0CurrentEpoch.minus(amount)
                : pool.gaugeFees0CurrentEpoch;
            const gaugeFees1CurrentEpoch = !isToken0
                ? pool.gaugeFees1CurrentEpoch.minus(amount)
                : pool.gaugeFees1CurrentEpoch;
            const gaugeFeesUSD = pool.gaugeFeesUSD.minus(amountUSD);
            const totalFees0 = isToken0 ? pool.totalFees0.minus(amount) : pool.totalFees0;
            const totalFees1 = !isToken0 ? pool.totalFees1.minus(amount) : pool.totalFees1;
            const totalFeesUSD = pool.totalFeesUSD.minus(amountUSD);

            pool = {
                ...pool,
                gaugeFees0CurrentEpoch,
                gaugeFees1CurrentEpoch,
                gaugeFeesUSD,
                totalFees0,
                totalFees1,
                totalFeesUSD,
            };
            gauge = { ...gauge, fees0: gaugeFees0CurrentEpoch, fees1: gaugeFees1CurrentEpoch };
            statistics = { ...statistics, totalFeesUSD: statistics.totalFeesUSD.minus(amountUSD) };
        } else {
            // Is bribe
            const totalBribesUSD = pool.totalBribesUSD.minus(amountUSD);
            pool = { ...pool, totalBribesUSD };
            statistics = { ...statistics, totalBribesUSD: statistics.totalBribesUSD.minus(amountUSD) };
        }

        context.Pool.set(pool);
        context.Gauge.set(gauge);
        context.Statistics.set(statistics);
    },
});
