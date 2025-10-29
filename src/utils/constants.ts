import { BigDecimal, BigInt, TypedMap } from '@graphprotocol/graph-ts';

// Chains
const MON_TESTNET = 'monad-testnet';
const FLUENT_TESTNET = 'fluent-testnet';

// Bigints
export const BI_ONE = BigInt.fromU64(1);
export const BI_ZERO = BigInt.zero();
export const LOCK_MAX_TIME = BigInt.fromU64(2 * 365 * 86400);
export const WEEK = BigInt.fromU64(7 * 86400);

// Zero address
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ONE_ADDRESS = '0x0000000000000000000000000000000000000001';

// Bigdecimals
export const BD_ONE = BigDecimal.fromString('1');
export const BD_ZERO = BigDecimal.zero();

// Oracles
export const ORACLES = new TypedMap<string, string>();
ORACLES.set(MON_TESTNET, '0x5caa9d7fac6ef9ff9f50b95008ffb9f6299e8bcd');
ORACLES.set(FLUENT_TESTNET, '0x4186F4901Ac2ED69a137bd6eC9187E0b4601d3C2');

// WETH
export const WETH = new TypedMap<string, string>();
WETH.set(MON_TESTNET, '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701');
WETH.set(FLUENT_TESTNET, '0x3d38E57b5d23c3881AffB8BC0978d5E0bd96c1C6');
