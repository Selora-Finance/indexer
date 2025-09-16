import { Address, createPublicClient, getContract, http } from 'viem';
import { BI_ZERO, Chains, RPC_URLS } from '../constants';
import gaugeAbi from './abis/gauge';

export class Gauge {
    private client: ReturnType<typeof createPublicClient>;
    private address: Address;

    protected constructor(chainId: Chains, address: Address) {
        this.address = address;
        this.client = createPublicClient({
            transport: http(RPC_URLS[chainId]),
        });
    }

    static init(chainId: number, address: Address) {
        return new Gauge(chainId, address);
    }

    private get contract() {
        return getContract({
            abi: gaugeAbi,
            address: this.address,
            client: this.client,
        });
    }

    async rewardToken() {
        try {
            const token = await this.contract.read.rewardToken();
            return token;
        } catch (error: any) {
            return null;
        }
    }

    async rewardRate() {
        try {
            const rate = await this.contract.read.rewardRate();
            return rate;
        } catch (error: any) {
            return BI_ZERO;
        }
    }
}
