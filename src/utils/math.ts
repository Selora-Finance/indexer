import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export function divideByBase(a: BigInt | BigDecimal, base: number = 18): BigDecimal {
    if (a instanceof BigInt) {
        a = a.toBigDecimal();
    }

    const divisor = BigInt.fromI64(10 ** base).toBigDecimal();
    return a.div(divisor);
}
