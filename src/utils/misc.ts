import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts';
import { Oracle } from '../../generated/PoolFactory/Oracle';
import { Bundle, Token } from '../../generated/schema';
import { BD_ZERO, ORACLES, WETH, BD_ONE } from './constants';
import { divideByBase, multiplyByBase } from './math';

export function deriveCLPosId(id: string): string {
    return 'CLPos - ' + id;
}

export function deriveMintId(transactionHash: string): string {
    return 'Mint - ' + transactionHash;
}

export function deriveBurnId(transactionHash: string): string {
    return 'Burn - ' + transactionHash;
}

export function loadTokenPrice(token: Token): Token {
    const networkName = dataSource.network();
    const oracleAddress = ORACLES.get(networkName) as string;
    const oracle = Oracle.bind(Address.fromString(oracleAddress));
    const usdPriceCall = oracle.try_getAverageValueInUSD(
        Address.fromString(token.id),
        multiplyByBase(BD_ONE, token.decimals),
    );
    const ethPriceCall = oracle.try_getAverageValueInETH(
        Address.fromString(token.id),
        multiplyByBase(BD_ONE, token.decimals),
    );
    token.derivedUSD = usdPriceCall.reverted ? BD_ZERO : divideByBase(usdPriceCall.value.getValue0(), 6);
    token.derivedETH = ethPriceCall.reverted ? BD_ZERO : divideByBase(ethPriceCall.value.getValue0());

    token.save();
    return token;
}

export function loadBundlePrice(): Bundle {
    const networkName = dataSource.network();
    const oracleAddress = ORACLES.get(networkName) as string;
    const oracle = Oracle.bind(Address.fromString(oracleAddress));

    const bundle = Bundle.load('1') as Bundle;
    const usdPriceCall = oracle.try_getAverageValueInUSD(
        Address.fromString(WETH.get(networkName) as string),
        multiplyByBase(BD_ONE),
    );

    bundle.ethPrice = usdPriceCall.reverted ? BD_ZERO : divideByBase(usdPriceCall.value.getValue0(), 6);
    bundle.save();
    return bundle;
}
