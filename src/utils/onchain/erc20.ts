import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';

export class ERC20 extends ethereum.SmartContract {
    protected constructor(address: string) {
        super('ERC20', Address.fromString(address));
    }

    static bind(address: string) {
        return new ERC20(address);
    }

    name(): ethereum.CallResult<string> {
        const result = super.tryCall('name', 'name():(string)', []);
        if (result.reverted) return new ethereum.CallResult();
        return ethereum.CallResult.fromValue(result.value[0].toString());
    }

    decimals(): ethereum.CallResult<i32> {
        const result = super.tryCall('decimals', 'decimals():(uint8)', []);
        if (result.reverted) return new ethereum.CallResult();
        return ethereum.CallResult.fromValue(result.value[0].toI32());
    }

    symbol(): ethereum.CallResult<string> {
        const result = super.tryCall('symbol', 'symbol():(string)', []);
        if (result.reverted) return new ethereum.CallResult();
        return ethereum.CallResult.fromValue(result.value[0].toString());
    }

    totalSupply(): ethereum.CallResult<BigInt> {
        const result = super.tryCall('totalSupply', 'totalSupply():(uint256)', []);
        if (result.reverted) return new ethereum.CallResult();
        return ethereum.CallResult.fromValue(result.value[0].toBigInt());
    }
}
