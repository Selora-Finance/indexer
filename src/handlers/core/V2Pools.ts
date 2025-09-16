import { Bundle, Burn, Mint, Pool, Statistics, Swap } from 'generated';
import { Pool_t, Statistics_t, Token_t } from 'generated/src/db/Entities.gen';
import { getAddress, toHex, zeroAddress } from 'viem';
import { divideByBase } from '../../utils/math';
import { loadBundlePrice, loadTokenPrices } from '../../utils/loaders';
import {
    createLiquidityPosition,
    updateOverallDayData,
    updatePoolDayData,
    updatePoolHourlyData,
    updateTokenDayData,
} from '../../utils/mutations';
import { ERC20 } from '../../utils/onchain/erc20';
import { BD_ZERO } from '../../utils/constants';
import { deriveId } from '../../utils/misc';

Pool.Swap.handlerWithLoader({
    loader: async ({ event, context }) => {
        const txId = deriveId(event.transaction.hash, event.chainId);
        const swaps = await context.Swap.getWhere.transaction_id.eq(txId);
        return { swaps };
    },
    handler: async ({ event, context, loaderReturn }) => {
        const poolAddress = getAddress(event.srcAddress);
        const poolId = deriveId(poolAddress, event.chainId);
        let pool = await context.Pool.get(poolId);

        if (!pool) return; // Must pass

        // Load ETH price first
        await loadBundlePrice(context, event.chainId);
        let token0 = (await context.Token.get(pool.token0_id)) as Token_t;
        let token1 = (await context.Token.get(pool.token1_id)) as Token_t;

        // Tokens
        token0 = await loadTokenPrices(context, token0, event.chainId);
        token1 = await loadTokenPrices(context, token1, event.chainId);

        const amount0In = divideByBase(event.params.amount0In, token0.decimals);
        const amount1In = divideByBase(event.params.amount1In, token1.decimals);
        const amount0Out = divideByBase(event.params.amount0Out, token0.decimals);
        const amount1Out = divideByBase(event.params.amount1Out, token1.decimals);
        const amount0Total = amount0In.plus(amount0Out);
        const amount1Total = amount1In.plus(amount1Out);
        const amount0ETH = amount0Total.multipliedBy(token0.derivedETH);
        const amount0USD = amount0Total.multipliedBy(token0.derivedUSD);
        const amount1ETH = amount1Total.multipliedBy(token1.derivedETH);
        const amount1USD = amount1Total.multipliedBy(token1.derivedUSD);

        pool = {
            ...pool,
            volumeETH: pool.volumeETH.plus(amount0ETH).plus(amount1ETH),
            volumeUSD: pool.volumeUSD.plus(amount0USD).plus(amount1USD),
            volumeToken0: pool.volumeToken0.plus(amount0Total),
            volumeToken1: pool.volumeToken1.plus(amount1Total),
            txCount: pool.txCount + 1n,
        };

        context.Pool.set(pool);

        token0 = {
            ...token0,
            tradeVolume: amount0Total.plus(token0.tradeVolume),
            tradeVolumeUSD: amount0USD.plus(token0.tradeVolumeUSD),
            txCount: token0.txCount + 1n,
        };

        context.Token.set(token0);

        token1 = {
            ...token1,
            tradeVolume: amount1Total.plus(token1.tradeVolume),
            tradeVolumeUSD: amount1USD.plus(token1.tradeVolumeUSD),
            txCount: token1.txCount + 1n,
        };

        context.Token.set(token1);
        // Transaction
        const hash = event.transaction.hash;
        const txId = deriveId(hash, event.chainId);
        let transaction = await context.Transaction.get(txId);

        if (!transaction) {
            transaction = {
                id: txId,
                block: BigInt(event.block.number),
                timestamp: BigInt(event.block.timestamp),
                hash,
            };

            context.Transaction.set(transaction);
        }

        const { swaps } = loaderReturn;
        const swapId = transaction.id + ':' + toHex(swaps.length);
        const swap: Swap = {
            id: swapId,
            transaction_id: transaction.id,
            timestamp: BigInt(event.block.timestamp),
            pool_id: pool.id,
            sender: event.params.sender,
            from: event.transaction.from ? event.transaction.from : event.params.sender,
            to: event.params.to,
            amount0In,
            amount1In,
            amount0Out,
            amount1Out,
            amountUSD: amount0USD.plus(amount1USD),
            logIndex: BigInt(event.logIndex),
        };

        context.Swap.set(swap);

        let statistics = (await context.Statistics.get(deriveId('1', event.chainId))) as Statistics;
        statistics = {
            ...statistics,
            txCount: statistics.txCount + 1n,
            totalTradeVolumeUSD: statistics.totalTradeVolumeUSD.plus(pool.volumeUSD),
            totalTradeVolumeETH: statistics.totalTradeVolumeETH.plus(pool.volumeETH),
        };

        context.Statistics.set(statistics);

        // Update total data
        updateOverallDayData(context, {
            blockTimestamp: event.block.timestamp,
            token0,
            token1,
            amount0: amount0Total,
            amount1: amount1Total,
            chainId: event.chainId,
        });

        // Update pool hourly data
        updatePoolHourlyData(context, {
            pool,
            blockTimestamp: event.block.timestamp,
            amount0: amount0Total,
            amount1: amount1Total,
            token0,
            token1,
        });

        // Update pool day data
        updatePoolDayData(context, {
            blockTimestamp: event.block.timestamp,
            pool,
            token0,
            token1,
            amount0: amount0Total,
            amount1: amount1Total,
        });

        // Update token day data
        updateTokenDayData(context, { blockTimestamp: event.block.timestamp, token: token0, amount: amount0Total });
        updateTokenDayData(context, { blockTimestamp: event.block.timestamp, token: token1, amount: amount1Total });
    },
});

Pool.Mint.handlerWithLoader({
    loader: async ({ event, context }) => {
        const mints = await context.Mint.getWhere.transaction_id.eq(deriveId(event.transaction.hash, event.chainId));
        return { mints };
    },
    handler: async ({ event, context, loaderReturn }) => {
        const poolAddress = getAddress(event.srcAddress);
        const poolId = deriveId(poolAddress, event.chainId);
        let pool = await context.Pool.get(poolId);
        let statistics = await context.Statistics.get(deriveId('1', event.chainId));

        if (!pool || !statistics) return; // Must pass

        // Load ETH price first
        await loadBundlePrice(context, event.chainId);
        let token0 = (await context.Token.get(pool.token0_id)) as Token_t;
        let token1 = (await context.Token.get(pool.token1_id)) as Token_t;

        // Tokens
        token0 = await loadTokenPrices(context, token0, event.chainId);
        token1 = await loadTokenPrices(context, token1, event.chainId);

        // Amounts
        const amount0 = divideByBase(event.params.amount0, token0.decimals);
        const amount1 = divideByBase(event.params.amount1, token1.decimals);
        const amount0USD = amount0.multipliedBy(token0.derivedUSD);
        const amount1USD = amount1.multipliedBy(token1.derivedUSD);

        token0 = { ...token0, txCount: token0.txCount + 1n };
        context.Token.set(token0);

        token1 = { ...token1, txCount: token1.txCount + 1n };
        context.Token.set(token1);

        statistics = { ...statistics, txCount: statistics.txCount + 1n };
        context.Statistics.set(statistics);

        pool = { ...pool, txCount: pool.txCount + 1n };
        context.Pool.set(pool);

        // Transaction
        const hash = event.transaction.hash;
        const txId = deriveId(hash, event.chainId);
        let transaction = await context.Transaction.get(txId);

        if (!transaction) {
            transaction = {
                id: txId,
                block: BigInt(event.block.number),
                timestamp: BigInt(event.block.timestamp),
                hash,
            };

            context.Transaction.set(transaction);
        }

        const { mints } = loaderReturn;
        let mint = mints[mints.length - 1];
        mint = {
            ...mint,
            amount0,
            amount1,
            sender: event.params.sender,
            amountUSD: amount0USD.plus(amount1USD),
            logIndex: BigInt(event.logIndex),
        };

        context.Mint.set(mint);

        // Update total data
        updateOverallDayData(context, {
            blockTimestamp: event.block.timestamp,
            token0,
            token1,
            amount0,
            amount1,
            chainId: event.chainId,
        });

        // Update pool hourly data
        updatePoolHourlyData(context, {
            pool,
            blockTimestamp: event.block.timestamp,
            amount0,
            amount1,
            token0,
            token1,
        });

        // Update pool day data
        updatePoolDayData(context, {
            blockTimestamp: event.block.timestamp,
            pool,
            token0,
            token1,
            amount0,
            amount1,
        });

        // Update token day data
        updateTokenDayData(context, { blockTimestamp: event.block.timestamp, token: token0, amount: amount0 });
        updateTokenDayData(context, { blockTimestamp: event.block.timestamp, token: token1, amount: amount1 });
    },
});

Pool.Sync.handler(async ({ event, context }) => {
    const poolAddress = getAddress(event.srcAddress);
    const poolId = deriveId(poolAddress, event.chainId);
    let pool = (await context.Pool.get(poolId)) as Pool_t;
    let token0 = (await context.Token.get(pool.token0_id)) as Token_t;
    let token1 = (await context.Token.get(pool.token1_id)) as Token_t;
    let statistics = (await context.Statistics.get(deriveId('1', event.chainId))) as Statistics_t;

    statistics = { ...statistics, totalVolumeLockedETH: statistics.totalVolumeLockedETH.minus(pool.reserveETH) };
    token0 = { ...token0, totalLiquidity: token0.totalLiquidity.minus(pool.reserve0) };
    token1 = { ...token1, totalLiquidity: token1.totalLiquidity.minus(pool.reserve1) };
    pool = {
        ...pool,
        reserve0: divideByBase(event.params.reserve0, token0.decimals),
        reserve1: divideByBase(event.params.reserve1, token1.decimals),
    };

    if (!pool.reserve1.isZero())
        pool = {
            ...pool,
            token0Price: pool.reserve0.dividedBy(pool.reserve1),
        };
    else
        pool = {
            ...pool,
            token0Price: BD_ZERO,
        };

    if (!pool.reserve0.isZero())
        pool = {
            ...pool,
            token1Price: pool.reserve1.dividedBy(pool.reserve0),
        };
    else
        pool = {
            ...pool,
            token1Price: BD_ZERO,
        };

    const bundle = (await loadBundlePrice(context, event.chainId)) as Bundle;
    token0 = await loadTokenPrices(context, token0, event.chainId);
    token1 = await loadTokenPrices(context, token1, event.chainId);
    pool = {
        ...pool,
        reserveETH: pool.reserve0.times(token0.derivedETH).plus(pool.reserve1.times(token1.derivedETH)),
        reserveUSD: pool.reserve0.times(token0.derivedUSD).plus(pool.reserve1.times(token1.derivedUSD)),
    };

    const totalVolumeLockedETH = statistics.totalVolumeLockedETH.plus(pool.reserveETH);
    statistics = {
        ...statistics,
        totalVolumeLockedETH,
        totalVolumeLockedUSD: totalVolumeLockedETH.times(bundle.ethPrice),
    };

    const totalLiquidity0 = token0.totalLiquidity.plus(pool.reserve0);
    const totalLiquidity1 = token1.totalLiquidity.plus(pool.reserve1);

    token0 = {
        ...token0,
        totalLiquidity: totalLiquidity0,
        totalLiquidityETH: totalLiquidity0.times(token0.derivedETH),
        totalLiquidityUSD: totalLiquidity0.times(token0.derivedUSD),
    };
    token1 = {
        ...token1,
        totalLiquidity: totalLiquidity1,
        totalLiquidityETH: totalLiquidity1.times(token1.derivedETH),
        totalLiquidityUSD: totalLiquidity1.times(token1.derivedUSD),
    };

    context.Pool.set(pool);
    context.Statistics.set(statistics);
    context.Token.set(token0);
    context.Token.set(token1);
});

Pool.Burn.handlerWithLoader({
    loader: async ({ event, context }) => {
        const txId = deriveId(event.transaction.hash, event.chainId);
        const burns = await context.Burn.getWhere.transaction_id.eq(txId);
        return { burns };
    },
    handler: async ({ event, context, loaderReturn }) => {
        const { burns } = loaderReturn;
        if (!burns.length) return; // Must contain burn

        let burn = burns[burns.length - 1];
        const poolAddress = getAddress(event.srcAddress);
        const poolId = deriveId(poolAddress, event.chainId);
        let pool = (await context.Pool.get(poolId)) as Pool_t;
        let statistics = (await context.Statistics.get(deriveId('1', event.chainId))) as Statistics_t;
        let token0 = (await context.Token.get(pool.token0_id)) as Token_t;
        let token1 = (await context.Token.get(pool.token1_id)) as Token_t;

        const token0Amount = divideByBase(event.params.amount0, token0.decimals);
        const token1Amount = divideByBase(event.params.amount1, token1.decimals);

        token0 = { ...token0, txCount: token0.txCount + 1n };
        token1 = { ...token1, txCount: token1.txCount + 1n };

        const amountTotalUSD = token0Amount.times(token0.derivedUSD).plus(token1Amount.times(token1.derivedUSD));
        statistics = { ...statistics, txCount: statistics.txCount + 1n };
        pool = { ...pool, txCount: pool.txCount + 1n };

        context.Token.set(token0);
        context.Token.set(token1);
        context.Pool.set(pool);
        context.Statistics.set(statistics);

        burn = {
            ...burn,
            amount0: token0Amount,
            amount1: token1Amount,
            sender: event.params.sender,
            to: event.params.to,
            amountUSD: amountTotalUSD,
            logIndex: BigInt(event.logIndex),
        };
        context.Burn.set(burn);

        // Update total data
        updateOverallDayData(context, {
            blockTimestamp: event.block.timestamp,
            token0,
            token1,
            amount0: token0Amount,
            amount1: token1Amount,
            chainId: event.chainId,
        });

        // Update pool hourly data
        updatePoolHourlyData(context, {
            pool,
            blockTimestamp: event.block.timestamp,
            amount0: token0Amount,
            amount1: token1Amount,
            token0,
            token1,
        });

        // Update pool day data
        updatePoolDayData(context, {
            blockTimestamp: event.block.timestamp,
            pool,
            token0,
            token1,
            amount0: token0Amount,
            amount1: token1Amount,
        });

        // Update token day data
        updateTokenDayData(context, { blockTimestamp: event.block.timestamp, token: token0, amount: token0Amount });
        updateTokenDayData(context, { blockTimestamp: event.block.timestamp, token: token1, amount: token1Amount });
    },
});

Pool.Fees.handler(async ({ event, context }) => {
    const poolAddress = getAddress(event.srcAddress);
    const poolId = deriveId(poolAddress, event.chainId);
    let pool = (await context.Pool.get(poolId)) as Pool_t;
    let token0 = (await context.Token.get(pool.token0_id)) as Token_t;
    let token1 = (await context.Token.get(pool.token1_id)) as Token_t;
    let statistics = (await context.Statistics.get(deriveId('1', event.chainId))) as Statistics_t;

    token0 = await loadTokenPrices(context, token0, event.chainId);
    token1 = await loadTokenPrices(context, token1, event.chainId);

    const amount0 = divideByBase(event.params.amount0, token0.decimals);
    const amount1 = divideByBase(event.params.amount1, token1.decimals);
    const amountUSD = amount0.times(token0.derivedUSD).plus(amount1.times(token1.derivedUSD));
    pool = {
        ...pool,
        totalFees0: pool.totalFees0.plus(amount0),
        totalFees1: pool.totalFees0.plus(amount1),
        totalFeesUSD: pool.totalFeesUSD.plus(amountUSD),
    };
    context.Pool.set(pool);

    statistics = {
        ...statistics,
        totalFeesUSD: statistics.totalFeesUSD.plus(amountUSD),
    };
    context.Statistics.set(statistics);
});

// Pool.Claim.handler(async ({ event, context }) => {
//   const poolAddress = getAddress(event.srcAddress);
//   const poolId = deriveId(poolAddress, event.chainId);
//   let pool = (await context.Pool.get(poolId)) as Pool_t;
//   let token0 = (await context.Token.get(pool.token0_id)) as Token_t;
//   let token1 = (await context.Token.get(pool.token1_id)) as Token_t;
//   let statistics = (await context.Statistics.get(deriveId('1', event.chainId))) as Statistics_t;

//   token0 = await loadTokenPrices(context, token0, event.chainId);
//   token1 = await loadTokenPrices(context, token1, event.chainId);

//   const amount0 = divideByBase(event.params.amount0, token0.decimals);
//   const amount1 = divideByBase(event.params.amount1, token1.decimals);
//   const amountUSD = amount0.times(token0.derivedUSD).plus(amount1.times(token1.derivedUSD));
//   const amountETH = amount0.times(token0.derivedETH).plus(amount1.times(token1.derivedETH));

//   const gaugeFees0CurrentEpoch =
//     typeof pool.gauge_id !== 'undefined' && getAddress(event.params.recipient) === pool.gauge_id
//       ? pool.gaugeFees0CurrentEpoch.plus(amount0)
//       : pool.gaugeFees0CurrentEpoch;
//   const gaugeFees1CurrentEpoch =
//     typeof pool.gauge_id !== 'undefined' && getAddress(event.params.recipient) === pool.gauge_id
//       ? pool.gaugeFees1CurrentEpoch.plus(amount1)
//       : pool.gaugeFees1CurrentEpoch;
//   const gaugeFeesUSD =
//     typeof pool.gauge_id !== 'undefined' && getAddress(event.params.recipient) === pool.gauge_id
//       ? pool.gaugeFeesUSD.plus(amountUSD)
//       : pool.gaugeFeesUSD;
//   pool = {
//     ...pool,
//     reserve0: pool.reserve0.minus(amount0),
//     reserve1: pool.reserve1.minus(amount1),
//     reserveETH: pool.reserveETH.minus(amountETH),
//     reserveUSD: pool.reserveUSD.minus(amountUSD),
//     totalFees0: pool.totalFees0.minus(amount0),
//     totalFees1: pool.totalFees0.minus(amount1),
//     totalFeesUSD: pool.totalFeesUSD.minus(amountUSD),
//     gaugeFees0CurrentEpoch,
//     gaugeFees1CurrentEpoch,
//     gaugeFeesUSD,
//   };
//   context.Pool.set(pool);

//   statistics = {
//     ...statistics,
//     totalFeesUSD: statistics.totalFeesUSD.minus(amountUSD),
//   };
//   context.Statistics.set(statistics);
// });

Pool.Transfer.handlerWithLoader({
    loader: async ({ event, context }) => {
        const txId = deriveId(event.transaction.hash, event.chainId);
        const mints = await context.Mint.getWhere.transaction_id.eq(txId);
        const burns = await context.Burn.getWhere.transaction_id.eq(txId);
        return { mints, burns };
    },
    handler: async ({ event, context, loaderReturn }) => {
        const poolAddress = getAddress(event.srcAddress);
        const poolId = deriveId(poolAddress, event.chainId);
        let pool = await context.Pool.get(poolId);

        if (!pool) return;

        const poolContract = ERC20.init(event.chainId, poolAddress);
        const value = divideByBase(event.params.value, 18);
        const hash = event.transaction.hash;
        const txId = deriveId(hash, event.chainId);
        let transaction = await context.Transaction.get(txId);

        if (!transaction) {
            transaction = {
                id: txId,
                block: BigInt(event.block.number),
                timestamp: BigInt(event.block.timestamp),
                hash,
            };

            context.Transaction.set(transaction);
        }

        const mutablePool = { ...pool };
        const { mints, burns } = loaderReturn;
        const isMint = event.params.from === zeroAddress;
        const isBurn = event.params.to === zeroAddress;

        if (isMint) {
            mutablePool.totalSupply = mutablePool.totalSupply.plus(value);
            context.Pool.set(mutablePool);

            if (mints.length === 0 || !!mints[mints.length - 1].sender) {
                const mintId = transaction.id + ':' + toHex(mints.length);
                const mint: Mint = {
                    id: mintId,
                    transaction_id: transaction.id,
                    pool_id: pool.id,
                    to: event.params.to,
                    liquidity: value,
                    timestamp: transaction.timestamp,
                    amount0: undefined,
                    amount1: undefined,
                    sender: undefined,
                    amountUSD: undefined,
                    feeLiquidity: undefined,
                    feeTo: undefined,
                    logIndex: undefined,
                };

                context.Mint.set(mint);
                mints.push(mint);
            }
        }

        if (getAddress(event.params.to) === poolAddress) {
            const burnId = transaction.id + ':' + toHex(burns.length);
            const burn: Burn = {
                id: burnId,
                transaction_id: transaction.id,
                pool_id: pool.id,
                liquidity: value,
                timestamp: transaction.timestamp,
                sender: event.params.from,
                to: event.params.to,
                needsComplete: true,
                amount0: undefined,
                amount1: undefined,
                amountUSD: undefined,
                feeLiquidity: undefined,
                feeTo: undefined,
                logIndex: undefined,
            };

            context.Burn.set(burn);
            burns.push(burn);
        }

        if (isBurn && getAddress(event.params.from) === poolAddress) {
            mutablePool.totalSupply = mutablePool.totalSupply.minus(value);
            context.Pool.set(mutablePool);

            let burn: Burn;

            if (burns.length) {
                const currentBurn = burns[burns.length];
                if (currentBurn.needsComplete) burn = currentBurn;
                else {
                    const burnId = transaction.id + ':' + toHex(burns.length);
                    burn = {
                        id: burnId,
                        transaction_id: transaction.id,
                        needsComplete: false,
                        pool_id: pool.id,
                        liquidity: value,
                        timestamp: transaction.timestamp,
                        amount0: undefined,
                        amount1: undefined,
                        amountUSD: undefined,
                        feeLiquidity: undefined,
                        feeTo: undefined,
                        logIndex: undefined,
                        sender: undefined,
                        to: undefined,
                    };
                }
            } else {
                const burnId = transaction.id + ':' + toHex(burns.length);
                burn = {
                    id: burnId,
                    transaction_id: transaction.id,
                    needsComplete: false,
                    pool_id: pool.id,
                    liquidity: value,
                    timestamp: transaction.timestamp,
                    amount0: undefined,
                    amount1: undefined,
                    amountUSD: undefined,
                    feeLiquidity: undefined,
                    feeTo: undefined,
                    logIndex: undefined,
                    sender: undefined,
                    to: undefined,
                };
            }

            if (mints.length && !mints[mints.length - 1].sender) {
                const mint = mints[mints.length - 1];
                burn = { ...burn, feeTo: mint.to, feeLiquidity: mint.liquidity };
                mints.pop();
            }

            context.Burn.set(burn);
        }

        if (!isMint && getAddress(event.params.from) !== poolAddress) {
            const address = getAddress(event.params.from);
            const balance = await poolContract.balanceOf(address);
            const amount = balance ? divideByBase(balance) : BD_ZERO;
            await createLiquidityPosition(context, {
                address,
                pool,
                amount,
                blockNumber: event.block.number,
                txId: transaction.id,
            });
        }

        if (!isBurn && getAddress(event.params.to) !== poolAddress) {
            const address = getAddress(event.params.to);
            const balance = await poolContract.balanceOf(address);
            const amount = balance ? divideByBase(balance) : BD_ZERO;
            await createLiquidityPosition(context, {
                address,
                pool,
                amount,
                blockNumber: event.block.number,
                txId: transaction.id,
            });
        }
    },
});
