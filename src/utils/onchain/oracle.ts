import { Address, createPublicClient, getContract, http, parseUnits } from 'viem';
import { Chains, ORACLES, RPC_URLS } from '../constants';
import oracleAbi from './abis/oracle';

export class Oracle {
    private client: ReturnType<typeof createPublicClient>;
    private address: Address;

    protected constructor(chainId: Chains) {
        this.address = ORACLES[chainId];
        this.client = createPublicClient({
            transport: http(RPC_URLS[chainId]),
        });
    }

    static init(chainId: number) {
        return new Oracle(chainId);
    }

    private get contract() {
        return getContract({
            abi: oracleAbi,
            address: this.address,
            client: this.client,
        });
    }

    async getPriceUSD(token: Address, decimals: number = 18) {
        try {
            const [valueInUSD] = await this.contract.read.getAverageValueInUSD([token, parseUnits('1', decimals)]);
            return valueInUSD;
        } catch (error: any) {
            return null;
        }
    }

    async getPriceETH(token: Address, decimals: number = 18) {
        try {
            const [valueInETH] = await this.contract.read.getAverageValueInETH([token, parseUnits('1', decimals)]);
            return valueInETH;
        } catch (error: any) {
            return null;
        }
    }
}
