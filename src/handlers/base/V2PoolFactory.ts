import { Address, log } from '@graphprotocol/graph-ts';
import { PoolCreated as V2PoolCreatedEvent } from '../../../generated/PoolFactory/PoolFactory';
import { Bundle, Pool, Statistics, Token } from '../../../generated/schema';
import { Pool as PoolTemplate } from '../../../generated/templates';
import { BD_ZERO, BI_ONE, BI_ZERO } from '../../utils/constants';
import { ERC20 } from '../../utils/onchain/erc20';

export function handlePoolCreated(event: V2PoolCreatedEvent) {
    const id = event.params.pool.toHex();
    const token0Id = event.params.token0.toHex();
    const token1Id = event.params.token1.toHex();
    let token0 = Token.load(token0Id);
    let token1 = Token.load(token1Id);
    let statistics = Statistics.load('1');
    let bundle = Bundle.load('1');

    if (statistics === null) {
        statistics = new Statistics('1');
        statistics.totalPairsCreated = BI_ZERO;
        statistics.totalVolumeLockedUSD = BD_ZERO;
        statistics.totalVolumeLockedETH = BD_ZERO;
        statistics.txCount = BI_ZERO;
        statistics.totalTradeVolumeETH = BD_ZERO;
        statistics.totalTradeVolumeUSD = BD_ZERO;
        statistics.totalFeesUSD = BD_ZERO;
        statistics.totalBribesUSD = BD_ZERO;
    }

    if (bundle === null) {
        bundle = new Bundle('1');
        bundle.ethPrice = BD_ZERO;
    }

    if (token0 === null) {
        token0 = new Token(token0Id);
        // Contract
        const contract = ERC20.bind(token0Id);
        const symbol = contract.symbol();
        const decimals = contract.decimals();
        const name = contract.name();
        const totalSupply = contract.totalSupply();

        if (symbol.reverted || decimals.reverted || name.reverted || totalSupply.reverted) {
            log.debug('Could not fetch token details', []);
            return;
        }

        token0.address = Address.fromHexString(token0Id);
        token0.derivedETH = BD_ZERO;
        token0.derivedUSD = BD_ZERO;
        token0.decimals = decimals.value;
        token0.symbol = symbol.value;
        token0.name = name.value;
        token0.totalLiquidity = BD_ZERO;
        token0.totalLiquidityETH = BD_ZERO;
        token0.totalLiquidityUSD = BD_ZERO;
        token0.tradeVolume = BD_ZERO;
        token0.tradeVolumeUSD = BD_ZERO;
        token0.txCount = BI_ZERO;

        token0.save();
    }

    if (token1 === null) {
        token1 = new Token(token1Id);
        // Contract
        const contract = ERC20.bind(token1Id);
        const symbol = contract.symbol();
        const decimals = contract.decimals();
        const name = contract.name();

        if (symbol.reverted || decimals.reverted || name.reverted) {
            log.debug('Could not fetch token details', []);
            return;
        }

        token1.address = Address.fromHexString(token1Id);
        token1.derivedETH = BD_ZERO;
        token1.derivedUSD = BD_ZERO;
        token1.decimals = decimals.value;
        token1.symbol = symbol.value;
        token1.name = name.value;
        token1.totalLiquidity = BD_ZERO;
        token1.totalLiquidityETH = BD_ZERO;
        token1.totalLiquidityUSD = BD_ZERO;
        token1.tradeVolume = BD_ZERO;
        token1.tradeVolumeUSD = BD_ZERO;
        token1.txCount = BI_ZERO;

        token1.save();
    }

    // Bind pool contract
    const contract = ERC20.bind(id);
    const name = contract.name();
    // Must pass
    if (name.reverted) {
        log.debug('Could not fetch name for new pool', []);
        return;
    }

    const pool = new Pool(id);
    pool.name = name.value;
    pool.address = Address.fromHexString(id);
    pool.token0 = token0.id;
    pool.token1 = token1.id;
    pool.createdAtBlockNumber = event.block.number;
    pool.createdAtTimestamp = event.block.timestamp;
    pool.gaugeFees0CurrentEpoch = BD_ZERO;
    pool.gaugeFees1CurrentEpoch = BD_ZERO;
    pool.gaugeFeesUSD = BD_ZERO;
    pool.totalFees0 = BD_ZERO;
    pool.totalFees1 = BD_ZERO;
    pool.totalFeesUSD = BD_ZERO;
    pool.totalBribesUSD = BD_ZERO;
    pool.txCount = BI_ZERO;
    pool.poolType = event.params.stable ? 'STABLE' : 'VOLATILE';
    pool.reserve0 = BD_ZERO;
    pool.reserve1 = BD_ZERO;
    pool.reserveETH = BD_ZERO;
    pool.reserveUSD = BD_ZERO;
    pool.token0Price = BD_ZERO;
    pool.token1Price = BD_ZERO;
    pool.totalEmissions = BD_ZERO;
    pool.totalEmissionsUSD = BD_ZERO;
    pool.totalSupply = BD_ZERO;
    pool.totalVotes = BD_ZERO;
    pool.volumeToken0 = BD_ZERO;
    pool.volumeToken1 = BD_ZERO;
    pool.volumeETH = BD_ZERO;
    pool.volumeUSD = BD_ZERO;
    pool.gauge = null;
    pool.tickSpacing = null;

    statistics.totalPairsCreated = statistics.totalPairsCreated.plus(BI_ONE);

    pool.save();
    statistics.save();
    bundle.save();

    PoolTemplate.create(event.params.pool);
}
