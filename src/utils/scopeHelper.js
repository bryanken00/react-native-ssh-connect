/**
 * Scope Helper Utilities
 * Provides consistent access to user scope
 */

import { useUserAuthStore } from "../store/useUserAuthStore";

/**
 * Get user scope
 * @returns {{userId: string|null}}
 */
export const getUserScope = () => {
  const { user } = useUserAuthStore.getState();
  return {
    userId: user?.userId ?? null,
  };
};
