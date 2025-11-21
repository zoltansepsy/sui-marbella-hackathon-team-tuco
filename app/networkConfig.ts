import { getFullnodeUrl } from "@mysten/sui/client";
import {
  DEVNET_COUNTER_PACKAGE_ID,
  TESTNET_COUNTER_PACKAGE_ID,
  MAINNET_COUNTER_PACKAGE_ID,
  DEVNET_JOB_ESCROW_PACKAGE_ID,
  TESTNET_JOB_ESCROW_PACKAGE_ID,
  MAINNET_JOB_ESCROW_PACKAGE_ID,
  DEVNET_PROFILE_NFT_PACKAGE_ID,
  TESTNET_PROFILE_NFT_PACKAGE_ID,
  MAINNET_PROFILE_NFT_PACKAGE_ID,
  DEVNET_REPUTATION_PACKAGE_ID,
  TESTNET_REPUTATION_PACKAGE_ID,
  MAINNET_REPUTATION_PACKAGE_ID,
} from "./constants";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        counterPackageId: DEVNET_COUNTER_PACKAGE_ID,
        jobEscrowPackageId: DEVNET_JOB_ESCROW_PACKAGE_ID,
        profileNftPackageId: DEVNET_PROFILE_NFT_PACKAGE_ID,
        reputationPackageId: DEVNET_REPUTATION_PACKAGE_ID,
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        counterPackageId: TESTNET_COUNTER_PACKAGE_ID,
        jobEscrowPackageId: TESTNET_JOB_ESCROW_PACKAGE_ID,
        profileNftPackageId: TESTNET_PROFILE_NFT_PACKAGE_ID,
        reputationPackageId: TESTNET_REPUTATION_PACKAGE_ID,
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        counterPackageId: MAINNET_COUNTER_PACKAGE_ID,
        jobEscrowPackageId: MAINNET_JOB_ESCROW_PACKAGE_ID,
        profileNftPackageId: MAINNET_PROFILE_NFT_PACKAGE_ID,
        reputationPackageId: MAINNET_REPUTATION_PACKAGE_ID,
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
