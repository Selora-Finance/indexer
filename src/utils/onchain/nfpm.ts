import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';

export class NFPM extends ethereum.SmartContract {
    protected constructor(address: string) {
        super('NFPM', Address.fromString(address));
    }

    static bind(address: string) {
        return new NFPM(address);
    }

    position(tokenId: BigInt): ethereum.CallResult<ethereum.Tuple> {
        const result = this.tryCall(
            'position',
            'position(uint256):(uint96,address,address,address,int24,int24,int24,uint128,uint256,uint256,uint128,uint128)',
            [ethereum.Value.fromUnsignedBigInt(tokenId)],
        );
        if (result.reverted) return new ethereum.CallResult();
        return ethereum.CallResult.fromValue(result.value[0].toTuple());
    }
}
