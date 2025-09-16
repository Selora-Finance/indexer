import { Address, createPublicClient, getContract, http } from 'viem';
import { BI_ZERO, Chains, RPC_URLS } from '../constants';
import v3PoolAbi from './abis/v3Pool';

export class V3Pool {
    private client: ReturnType<typeof createPublicClient>;
    private address: Address;

    protected constructor(chainId: Chains, address: Address) {
        this.address = address;
        this.client = createPublicClient({
            transport: http(RPC_URLS[chainId]),
        });
    }

    static init(chainId: number, address: Address) {
        return new V3Pool(chainId, address);
    }

    private get contract() {
        return getContract({
            abi: v3PoolAbi,
            address: this.address,
            client: this.client,
        });
    }

    async gaugeFees() {
        try {
            const gaugeFee = await this.contract.read.gaugeFees();
            return gaugeFee;
        } catch (error: any) {
            return [BI_ZERO, BI_ZERO] as [bigint, bigint];
        }
    }
}
