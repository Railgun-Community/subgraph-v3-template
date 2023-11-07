## Subgraph template for RAILGUN V2

### Run tests:

yarn test

### Single test (ex):

graph test src/railgun-smart-wallet-v2.1-new-shield -v 0.5.2 -r

- -r is to recompile on each load (good idea)
- -v is version number for matchstick (I think?)... seems to work

### Codegen

graph codegen

### Build and Deploy

graph build --network mainnet

// Options: mainnet, goerli, sepolia, matic, mumbai, bsc, arbitrum-one, arbitrum-goerli

graph deploy --product hosted-service railgun-community/railgun-v2-ethereum

// Options: railgun-v2-ethereum, railgun-v2-goerli, railgun-v2-bsc, railgun-v2-polygon, railgun-v2-mumbai, railgun-v2-arbitrum, railgun-v2-arbitrum-goerli, railgun-v2-sepolia

### Master build and deploy

./build-deploy-all

### Show network names

graph init --help
