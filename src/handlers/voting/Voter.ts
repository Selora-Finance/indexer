import { log } from '@graphprotocol/graph-ts';
import {
    GaugeCreated as GaugeCreatedEvent,
    GaugeKilled as GaugeKilledEvent,
    GaugeRevived as GaugeRevivedEvent,
    Voted as VotedEvent,
} from '../../../generated/Voter/Voter';
import { Gauge, LockPosition, Pool, Token } from '../../../generated/schema';
import { ERC20 } from '../../../generated/CLFactory/ERC20';
import { Gauge as GaugeContract } from '../../../generated/templates/Gauge/Gauge';
import { BD_ZERO, BI_ZERO } from '../../utils/constants';
import {
    CLGauge as CLGaugeTemplate,
    Gauge as GaugeTemplate,
    VotingReward as VotingRewardTemplate,
} from '../../../generated/templates';
import { divideByBase } from '../../utils/math';

export function handleGaugeCreated(event: GaugeCreatedEvent): void {
    const id = event.params.gauge.toHex();
    const poolAddress = event.params.pool;
    const poolId = poolAddress.toHex();
    const pool = Pool.load(poolId) as Pool;
    const gaugeContract = GaugeContract.bind(event.params.gauge);
    const rewardTokenResult = gaugeContract.try_rewardToken();
    if (rewardTokenResult.reverted) return;
    const rewardTokenAddress = rewardTokenResult.value;
    const rewardTokenId = rewardTokenAddress.toHex();
    let rewardToken = Token.load(rewardTokenId);

    if (rewardToken === null) {
        rewardToken = new Token(rewardTokenId);
        // Contract
        const contract = ERC20.bind(rewardTokenAddress);
        const symbol = contract.try_symbol();
        const decimals = contract.try_decimals();
        const name = contract.try_name();

        if (symbol.reverted || decimals.reverted || name.reverted) {
            log.debug('Could not fetch token details', []);
            return;
        }

        rewardToken.address = rewardTokenAddress;
        rewardToken.derivedETH = BD_ZERO;
        rewardToken.derivedUSD = BD_ZERO;
        rewardToken.decimals = decimals.value;
        rewardToken.symbol = symbol.value;
        rewardToken.name = name.value;
        rewardToken.totalLiquidity = BD_ZERO;
        rewardToken.totalLiquidityETH = BD_ZERO;
        rewardToken.totalLiquidityUSD = BD_ZERO;
        rewardToken.tradeVolume = BD_ZERO;
        rewardToken.tradeVolumeUSD = BD_ZERO;
        rewardToken.txCount = BI_ZERO;

        rewardToken.save();
    }

    const gauge = new Gauge(id);
    gauge.isAlive = true;
    gauge.depositPool = pool.id;
    gauge.address = event.params.gauge;
    gauge.bribeVotingReward = event.params.bribeVotingReward;
    gauge.feeVotingReward = event.params.feeVotingReward;
    gauge.emission = BD_ZERO;
    gauge.fees0 = BD_ZERO;
    gauge.fees1 = BD_ZERO;
    gauge.rewardRate = BD_ZERO;
    gauge.rewardToken = rewardToken.id;
    gauge.totalSupply = BD_ZERO;

    gauge.save();

    pool.gauge = gauge.id;
    pool.save();

    if (pool.poolType === 'CONCENTRATED') {
        CLGaugeTemplate.create(event.params.gauge);
    } else {
        GaugeTemplate.create(event.params.gauge);
    }

    VotingRewardTemplate.create(gauge.feeVotingReward);
    VotingRewardTemplate.create(gauge.bribeVotingReward);
}

export function handleGaugeKilled(event: GaugeKilledEvent): void {
    const gaugeId = event.params.gauge.toHex();
    const gauge = Gauge.load(gaugeId);
    if (gauge === null) return;
    gauge.isAlive = false;
    gauge.save();
}

export function handleGaugeRevived(event: GaugeRevivedEvent): void {
    const gaugeId = event.params.gauge.toHex();
    const gauge = Gauge.load(gaugeId);
    if (gauge === null) return;
    gauge.isAlive = true;
    gauge.save();
}

export function handleVoted(event: VotedEvent): void {
    const pool = Pool.load(event.params.pool.toHex()) as Pool;
    const lock = LockPosition.load(event.params.tokenId.toString()) as LockPosition;
    const weight = divideByBase(event.params.weight);
    pool.totalVotes = pool.totalVotes.plus(weight);
    lock.totalVoteWeightGiven = lock.totalVoteWeightGiven.plus(weight);
    pool.save();
    lock.save();
}
