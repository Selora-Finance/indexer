import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts';
import { Oracle } from '../../generated/PoolFactory/Oracle';
import { Bundle, Token } from '../../generated/schema';
import { BI_ONE, BD_ZERO, ORACLES, WETH } from './constants';
import { divideByBase, multiplyByBase } from './math';

export function deriveCLPosId(id: BigInt | string) {
    if (typeof id !== 'string') id = id.toString();
    return 'CLPos - ' + id;
}

export function deriveMintId(transactionHash: string) {
    return 'Mint - ' + transactionHash;
}

export function deriveBurnId(transactionHash: string) {
    return 'Burn - ' + transactionHash;
}

export function loadTokenPrice(token: Token) {
    const networkName = dataSource.network() as keyof typeof ORACLES;
    const oracleAddress = ORACLES[networkName];
    const oracle = Oracle.bind(Address.fromString(oracleAddress));
    const usdPriceCall = oracle.try_getAverageValueInUSD(
        Address.fromString(token.id),
        multiplyByBase(BI_ONE, token.decimals),
    );
    const ethPriceCall = oracle.try_getAverageValueInETH(
        Address.fromString(token.id),
        multiplyByBase(BI_ONE, token.decimals),
    );
    token.derivedUSD = usdPriceCall.reverted ? BD_ZERO : divideByBase(usdPriceCall.value.getValue0().toBigDecimal(), 6);
    token.derivedETH = ethPriceCall.reverted ? BD_ZERO : divideByBase(ethPriceCall.value.getValue0().toBigDecimal());

    token.save();
    return token;
}

export function loadBundlePrice() {
    const networkName = dataSource.network() as keyof typeof ORACLES;
    const oracleAddress = ORACLES[networkName];
    const oracle = Oracle.bind(Address.fromString(oracleAddress));

    const bundle = Bundle.load('1') as Bundle;
    const usdPriceCall = oracle.try_getAverageValueInUSD(Address.fromString(WETH[networkName]), multiplyByBase(BI_ONE));

    bundle.ethPrice = usdPriceCall.reverted ? BD_ZERO : divideByBase(usdPriceCall.value.getValue0().toBigDecimal(), 6);
    bundle.save();
    return bundle;
}
