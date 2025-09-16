import { BigInt } from '@graphprotocol/graph-ts';

export function deriveCLPosId(id: BigInt | string) {
    if (typeof id !== 'string') id = id.toString();
    return 'CLPos - ' + id;
}
