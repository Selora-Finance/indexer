import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export function divideByBase(a: BigInt | BigDecimal, base: number = 18): BigDecimal {
    if (a instanceof BigInt) {
        a = a.toBigDecimal();
    }

    const divisor = BigInt.fromI64(10 ** base).toBigDecimal();
    return a.div(divisor);
}

export function multiplyByBase(a: BigInt | BigDecimal, base: number = 18): BigInt {
    if (a instanceof BigInt) {
        a = a.toBigDecimal();
    }

    const multiplier = BigInt.fromI64(10 ** base).toBigDecimal();
    return BigInt.fromString(a.times(multiplier).toString());
}
