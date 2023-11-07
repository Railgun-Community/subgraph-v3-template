## Subgraph template for RAILGUN V3

### Run tests:

yarn test

### Single test (ex):

graph test src/poseidon-merkle-accumulator-events -v 0.5.2 -r

- -r is to recompile on each load (good idea)
- -v is version number for matchstick (I think?)... seems to work

### Codegen

graph codegen

### Build and Deploy

graph build --network mainnet

// Options: mainnet, goerli, sepolia, matic, mumbai, bsc, arbitrum-one, arbitrum-goerli

graph deploy --product hosted-service railgun-community/railgun-v3-ethereum

// Options: railgun-v3-ethereum, railgun-v3-goerli, railgun-v3-bsc, railgun-v3-polygon, railgun-v3-mumbai, railgun-v3-arbitrum, railgun-v3-arbitrum-goerli, railgun-v3-sepolia

### Master build and deploy

./build-deploy-all

### Show network names

graph init --help
