import axios from "axios";
import { BASE_URL } from "../../constants";

/**
 * Configured axios instances.
 *
 * ── What changed when login was removed ─────────────────────────────────────
 * These used to carry a bearer token from the auth store and reset that store
 * on `Invalid token.`. The store is gone, so both interceptors went with it —
 * what is left is a plain instance with a base URL and the right content type.
 *
 * (The response interceptor also called `Toast.show` without importing Toast,
 * which would have thrown a ReferenceError the first time a request failed
 * that way. It never fired because nothing used it.)
 *
 * Nothing in the app calls these today: the SSH client talks to servers
 * directly over its own transport, not over HTTP. They stay as the starting
 * point for whenever this app does need a backend — a sync endpoint, a licence
 * check, telemetry.
 *
 * If you add auth later, the request interceptor goes back here and reads the
 * token from wherever you keep it. Keep it out of `requests/`: this file
 * describes how to reach the server, and `requests/` owns the side effects.
 */

export const axiosAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

/**
 * @param {'data'|'form'} type - 'data' sends JSON, anything else multipart
 */
export const createAxiosInstance = (type = "data") => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
  };

  if (type === "data") {
    headers["Content-Type"] = "application/json";
  } else {
    headers["content-type"] = "multipart/form-data";
  }

  return axios.create({ baseURL: BASE_URL, headers });
};
