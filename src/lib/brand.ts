import type { Env } from "../types";

export const DEFAULT_SUPPORT_SERVER_URL = "https://discord.gg/QW7CZczhT4";
export const DEVELOPER_HANDLES = ["@xepp.\_.", "@reckiscool", "@yoshika.\_."] as const;
export const DEVELOPER_CREDIT = `MADE BY ${DEVELOPER_HANDLES.join(" / ")}`;

export function supportServerUrl(env?: Pick<Env, "SUPPORT_SERVER_URL">) {
  return env?.SUPPORT_SERVER_URL?.trim() || DEFAULT_SUPPORT_SERVER_URL;
}

export function compactUrlLabel(url: string) {
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/g, "");
}

export function supportServerLabel(env?: Pick<Env, "SUPPORT_SERVER_URL">) {
  return compactUrlLabel(supportServerUrl(env));
}
