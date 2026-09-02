/**
 * Request hooks — Auth
 *
 * The `requests/` layer is where side effects live: store writes, Toasts,
 * cache invalidation. The `api/` layer stays pure — it only makes the call and
 * returns `response.data`.
 *
 * Import API functions from services/api/ — never call an axios instance here.
 *
 * ── Demo mode ───────────────────────────────────────────────────────────────
 * When `IS_DEMO` is on, every hook below short-circuits before its API call
 * and resolves from `constants/demo.js` instead, so the app runs with no
 * backend at all. The bypass lives here rather than in `api/` on purpose:
 * `api/` describes your server, and a fake user is not something your server
 * does. Everything after the mutation — store writes, toasts, navigation — is
 * identical in both modes, so demo mode exercises the real flow.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { IS_DEMO } from "../../constants";
import { DEMO_TOKEN, demoDelay, makeDemoUser } from "../../constants/demo";
import { useUserAuthStore } from "../../store/useUserAuthStore";
import { loginApi, getMeApi, changePasswordApi, logoutApi } from "../api/auth";

// ─────────────────────────────────────────────────────────────────────────────
// useLoginAuth
// ─────────────────────────────────────────────────────────────────────────────
export const useLoginAuth = () => {
  // Call the Zustand hook directly inside the custom hook, not getState()
  const login = useUserAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (payload) => {
      if (IS_DEMO) {
        await demoDelay();
        // Same shape loginApi returns, so onSuccess needs no branch
        return { token: DEMO_TOKEN, user: makeDemoUser(payload?.email) };
      }
      return loginApi(payload);
    },
    onSuccess: (data) => {
      const { token, user } = data;

      login(
        {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          permissions: user.permissions || null,
        },
        token,
      );

      Toast.show({
        type: "success",
        text1: "Login successful",
        ...(IS_DEMO && { text2: "Demo mode — no server was contacted" }),
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: error.response?.data?.message || "Something went wrong",
      });
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useGetMe
// ─────────────────────────────────────────────────────────────────────────────
export const useGetMe = (options = {}) => {
  const user = useUserAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      if (IS_DEMO) {
        await demoDelay();
        return { user: user ?? makeDemoUser() };
      }
      return getMeApi();
    },
    ...options,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useChangePassword
// ─────────────────────────────────────────────────────────────────────────────
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload) => {
      if (IS_DEMO) {
        await demoDelay();
        return { message: "Password changed" };
      }
      return changePasswordApi(payload);
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Password changed successfully",
        ...(IS_DEMO && { text2: "Demo mode — nothing was saved" }),
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to change password",
        text2: error.response?.data?.message || "Something went wrong",
      });
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useLogout
// ─────────────────────────────────────────────────────────────────────────────
export const useLogout = () => {
  const logout = useUserAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      if (IS_DEMO) return { message: "Logged out" };
      return logoutApi();
    },
    onSuccess: () => {
      logout();
      Toast.show({ type: "success", text1: "Logged out successfully" });
    },
    onError: () => {
      // Clear local state even if the server call fails, so a network error
      // can never trap someone in a signed-in state.
      logout();
    },
  });
};
