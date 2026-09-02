import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Auth store — persisted to AsyncStorage, so a session survives app restarts.
 *
 * `isAuthenticated` is what Navigation switches on. Nothing else should decide
 * whether the user is signed in.
 *
 * The token is read by the axios request interceptor via `getState()` — see
 * services/api/axios.js. Do not pass it around manually.
 *
 * Note this persists the token to AsyncStorage, which is not encrypted. If you
 * are handling sensitive data, swap the storage for `expo-secure-store`.
 */
export const useUserAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      /**
       * Called by useLoginAuth on a successful login.
       * @param {object} user  - user object from the server
       * @param {string} token - JWT
       */
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      /** Update user info in place, e.g. after a profile edit */
      setUser: (user) => set({ user }),

      /** Clear all auth state — called on logout */
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "user-auth",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
