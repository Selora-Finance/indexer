import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

// Chains
export enum Chains {
    MON_TESTNET = 'monad-testnet',
    FLUENT_TESTNET = 'fluent-testnet',
}

// Bigints
export const BI_ONE = BigInt.fromU64(1);
export const BI_ZERO = BigInt.zero();
export const LOCK_MAX_TIME = BigInt.fromU64(2 * 365 * 86400);
export const WEEK = BigInt.fromU64(7 * 86400);

// Zero address
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Bigdecimals
export const BD_ONE = BigDecimal.fromString('1');
export const BD_ZERO = BigDecimal.zero();

export const RPC_URLS: { [key in Chains]: string } = {
    [Chains.MON_TESTNET]: 'https://testnet-rpc.monad.xyz',
    [Chains.FLUENT_TESTNET]: 'https://rpc.testnet.fluent.xyz',
};

// Oracles
export const ORACLES: { [key in Chains]: `0x${string}` } = {
    [Chains.MON_TESTNET]: '0x5caa9d7fac6ef9ff9f50b95008ffb9f6299e8bcd',
    [Chains.FLUENT_TESTNET]: '0x924b04EdafC8E375388978291935a78C3DCdf7E5',
};

// NFPM
export const NFP: { [key in Chains]: `0x${string}` } = {
    [Chains.MON_TESTNET]: '0x2a4440dF3351Bac4e7cb8b1D12E07f004aBc3372',
    [Chains.FLUENT_TESTNET]: '0x1CC255Fb449181ae46Ee302D108549ba8B67752B',
};

// WETH
export const WETH: { [key in Chains]: `0x${string}` } = {
    [Chains.MON_TESTNET]: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
    [Chains.FLUENT_TESTNET]: '0x3d38E57b5d23c3881AffB8BC0978d5E0bd96c1C6',
};

// NFT managers
export const NFT_MANAGERS: { [key in Chains]: `0x${string}` } = {
    [Chains.MON_TESTNET]: '0x2a4440dF3351Bac4e7cb8b1D12E07f004aBc3372',
    [Chains.FLUENT_TESTNET]: '0x1CC255Fb449181ae46Ee302D108549ba8B67752B',
};
