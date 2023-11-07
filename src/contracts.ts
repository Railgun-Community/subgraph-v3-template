import { CHAIN_ID } from './chain-id';

export const getPoseidonT4ContractAddress = (): string => {
  const chainId = CHAIN_ID;

  switch (chainId) {
    case 1:
      return '0xcb2ebd9fcb570db7b4f723461efce7e1f3b5b5a3'; // Ethereum
    case 5:
      return '0xD72bEfcbdDd9615E90887b822Daa0115e751407a'; // Goerli
    case 56:
      return '0xa214d47e24de000dcdc83ef6cda192e5fc74a067'; // BSC
    case 137:
      return '0x6fe17dcf4f0296dc4d1382ee2a79051edb7f02db'; // Polygon
    case 42161:
      return '0x753f0f9ba003dda95eb9284533cf5b0f19e441dc'; // Arbitrum
    case 80001:
      return '0x22dd4ff4631bb0ad56e0ed6274dcce04d96af84e'; // Mumbai
    case 421613:
      return '0xfbc165e5601c9b658b63f71debe06a9f296f1ab7'; // Arbitrum Goerli
  }
  throw new Error(`Unrecognized chain ID: ${chainId.toString()}`);
};
