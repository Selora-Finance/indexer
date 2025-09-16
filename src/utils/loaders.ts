import { getAddress } from 'viem';
import { Cache, CacheCategory } from './cache';
import { Chains, WETH } from './constants';
import { ERC20 } from './onchain/erc20';
import { Bundle, handlerContext, Token } from 'generated';
import { Oracle } from './onchain/oracle';
import { divideByBase } from './math';
import { deriveId } from './misc';

export async function loadTokenDetails(address: string, chainId: number = Chains.MON_TESTNET) {
    try {
        // Viem compliant address
        const viemCompliantAddress = getAddress(address);
        // Load cache first
        const cache = Cache.init(CacheCategory.Token, chainId);
        const token = cache.read(viemCompliantAddress);

        if (token) return { ...token, id: deriveId(viemCompliantAddress, chainId) };

        // Bind contract
        const erc20Contract = ERC20.init(chainId, viemCompliantAddress);
        const [decimals, name, symbol] = await Promise.all([
            erc20Contract.decimals(),
            erc20Contract.name(),
            erc20Contract.symbol(),
        ]);

        if (decimals && name && symbol) {
            // New shape
            const newTokenShape = { decimals, name, symbol } as const;
            // Save in cache for future reference
            cache.add({
                [viemCompliantAddress]: newTokenShape as any,
            });

            return { ...newTokenShape, id: deriveId(viemCompliantAddress, chainId) };
        } else return null;
    } catch (error: any) {
        return null;
    }
}

export async function loadTokenPrices(context: handlerContext, token: Token, chainId: number = Chains.MON_TESTNET) {
    // Load oracle
    const oracle = Oracle.init(chainId);
    // Token address checksumed
    const viemCompliantAddress = getAddress(token.address);
    // prices
    const bundle = (await context.Bundle.get(deriveId('1', chainId))) as Bundle;
    const eth = await oracle.getPriceETH(viemCompliantAddress, token.decimals);
    // Mutate
    const newToken = {
        ...token,
        derivedUSD: eth !== null ? bundle.ethPrice.multipliedBy(divideByBase(eth)) : token.derivedUSD,
        derivedETH: eth !== null ? divideByBase(eth) : token.derivedETH,
    };
    context.Token.set(newToken);
    return context.Token.get(token.id) as Promise<Token>;
}

export async function loadBundlePrice(context: handlerContext, chainId: Chains = Chains.MON_TESTNET) {
    // Load oracle
    const oracle = Oracle.init(chainId);
    // Token address checksumed
    const viemCompliantAddress = getAddress(WETH[chainId]);
    const usd = await oracle.getPriceUSD(viemCompliantAddress, 18);
    let bundle = (await context.Bundle.get(deriveId('1', chainId))) as Bundle;
    bundle = { ...bundle, ethPrice: usd !== null ? divideByBase(usd) : bundle.ethPrice };
    context.Bundle.set(bundle);
    return context.Bundle.get(bundle.id) as Promise<Bundle>;
}
