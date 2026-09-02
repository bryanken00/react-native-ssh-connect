/**
 * API — Admin Auth
 * All functions return response.data (no side effects, no store access).
 */
import { axiosAuth, createAxiosInstanceWithInterceptor } from "./axios";

const axiosDefault = createAxiosInstanceWithInterceptor("data");

const BASE = "/api/v1/admin/auth";

export const loginApi = async (payload) => {
  const response = await axiosAuth.post(`${BASE}/login`, payload);
  return response.data; // { message, token, user }
};

export const getMeApi = async () => {
  const response = await axiosDefault.get(`${BASE}/me`);
  return response.data; // { user }
};

export const changePasswordApi = async (payload) => {
  const response = await axiosDefault.post(`${BASE}/change-password`, payload);
  return response.data;
};

export const logoutApi = async () => {
  const response = await axiosDefault.post(`${BASE}/logout`);
  return response.data;
};
