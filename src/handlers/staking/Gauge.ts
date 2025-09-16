import { Gauge } from 'generated';
import { deriveId } from '../../utils/misc';
import { getAddress } from 'viem';
import { Gauge_t, Token_t, User_t } from 'generated/src/db/Entities.gen';
import { createGaugePosition } from '../../utils/mutations';
import { divideByBase } from '../../utils/math';
import { Gauge as OnchainGauge } from '../../utils/onchain/gauge';

Gauge.Deposit.handlerWithLoader({
    loader: async ({ event, context }) => {
        const gaugeId = deriveId(getAddress(event.srcAddress), event.chainId);
        const gauge = (await context.Gauge.get(gaugeId)) as Gauge_t;
        return { gauge };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { gauge } = loaderReturn;
        const userAddress = getAddress(event.params.to);
        const depositorId = deriveId(userAddress, event.chainId);
        let user = await context.User.get(depositorId);

        if (!user) {
            if (!user) {
                user = {
                    id: depositorId,
                    address: userAddress,
                };
                context.User.set(user);
            }
        }
        const amount = divideByBase(event.params.amount);
        gauge = { ...gauge, totalSupply: gauge.totalSupply.plus(amount) };
        context.Gauge.set(gauge);
        await createGaugePosition(context, {
            user,
            gauge,
            txId: event.transaction.hash,
            amount,
            blockNumber: event.block.number,
        });
    },
});

Gauge.Withdraw.handlerWithLoader({
    loader: async ({ event, context }) => {
        const gaugeId = deriveId(getAddress(event.srcAddress), event.chainId);
        const gauge = (await context.Gauge.get(gaugeId)) as Gauge_t;
        return { gauge };
    },
    handler: async ({ event, context, loaderReturn }) => {
        let { gauge } = loaderReturn;
        const userAddress = getAddress(event.params.from);
        const withdrawerId = deriveId(userAddress, event.chainId);
        const user = (await context.User.get(withdrawerId)) as User_t;
        let amount = divideByBase(event.params.amount);
        gauge = { ...gauge, totalSupply: gauge.totalSupply.minus(amount) };
        context.Gauge.set(gauge);
        amount = amount.negated();
        await createGaugePosition(context, {
            user,
            gauge,
            txId: event.transaction.hash,
            amount,
            blockNumber: event.block.number,
        });
    },
});

Gauge.NotifyReward.handler(async ({ event, context }) => {
    const gaugeAddress = getAddress(event.srcAddress);
    const gaugeId = deriveId(gaugeAddress, event.chainId);
    let gauge = (await context.Gauge.get(gaugeId)) as Gauge_t;
    const rewardToken = (await context.Token.get(gauge.rewardToken_id)) as Token_t;
    const amount = divideByBase(event.params.amount, rewardToken.decimals);
    const rate = await OnchainGauge.init(event.chainId, gaugeAddress).rewardRate();
    const rewardRate = divideByBase(rate);
    gauge = { ...gauge, rewardRate, emission: gauge.emission.plus(amount) };
    context.Gauge.set(gauge);
});

Gauge.ClaimRewards.handler(async ({ event, context }) => {
    const gaugeAddress = getAddress(event.srcAddress);
    const gaugeId = deriveId(gaugeAddress, event.chainId);
    let gauge = (await context.Gauge.get(gaugeId)) as Gauge_t;
    const rewardToken = (await context.Token.get(gauge.rewardToken_id)) as Token_t;
    const amount = divideByBase(event.params.amount, rewardToken.decimals);
    gauge = { ...gauge, emission: gauge.emission.minus(amount) };
    context.Gauge.set(gauge);
});
