/**
 * useProfile Hook
 * Custom hook for fetching and caching profile data
 *
 * DEV 3 TODO:
 * 1. Implement with @tanstack/react-query
 * 2. Add profile creation check
 * 3. Add optimistic updates for profile edits
 * 4. Test with real profile data
 */

"use client";

import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { useMemo } from "react";
import { createProfileService, type ProfileData } from "../services";

/**
 * Hook to fetch profile by ID
 *
 * TODO: Implement with useSuiClientQuery or react-query
 *
 * @param profileId Profile object ID
 * @returns Profile data, loading state, error, and refetch function
 */
export function useProfile(profileId: string | undefined) {
  const suiClient = useSuiClient();
  const profilePackageId = useNetworkVariable("profileNftPackageId");

  const profileService = useMemo(
    () => createProfileService(suiClient, profilePackageId),
    [suiClient, profilePackageId]
  );

  // TODO: Implement with useSuiClientQuery or useQuery

  return {
    profile: null as ProfileData | null,
    isPending: false,
    error: null as Error | null,
    refetch: async () => {},
  };
}

/**
 * Hook to fetch current user's profile
 *
 * TODO: Implement
 * - Check if user has a profile
 * - Return hasProfile flag for profile creation flow
 *
 * @returns Current user's profile, hasProfile flag, loading state
 */
export function useCurrentProfile() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const profilePackageId = useNetworkVariable("profileNftPackageId");

  const profileService = useMemo(
    () => createProfileService(suiClient, profilePackageId),
    [suiClient, profilePackageId]
  );

  // TODO: Implement

  return {
    profile: null as ProfileData | null,
    hasProfile: false,
    isPending: false,
    error: null as Error | null,
    refetch: async () => {},
  };
}

/**
 * Hook to fetch profile by owner address
 *
 * TODO: Implement
 *
 * @param ownerAddress Owner's address
 * @returns Profile data, loading state, error
 */
export function useProfileByOwner(ownerAddress: string | undefined) {
  const suiClient = useSuiClient();
  const profilePackageId = useNetworkVariable("profileNftPackageId");

  const profileService = useMemo(
    () => createProfileService(suiClient, profilePackageId),
    [suiClient, profilePackageId]
  );

  // TODO: Implement

  return {
    profile: null as ProfileData | null,
    isPending: false,
    error: null as Error | null,
    refetch: async () => {},
  };
}

/**
 * Hook to fetch top-rated freelancers
 *
 * TODO: Implement
 *
 * @param limit Number of profiles to fetch
 * @returns Array of top profiles, loading state, error
 */
export function useTopFreelancers(limit: number = 10) {
  const suiClient = useSuiClient();
  const profilePackageId = useNetworkVariable("profileNftPackageId");

  const profileService = useMemo(
    () => createProfileService(suiClient, profilePackageId),
    [suiClient, profilePackageId]
  );

  // TODO: Implement

  return {
    profiles: [] as ProfileData[],
    isPending: false,
    error: null as Error | null,
    refetch: async () => {},
  };
}
