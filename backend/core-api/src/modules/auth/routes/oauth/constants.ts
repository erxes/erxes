export const DEVICE_CODE_EXPIRES_IN = 10 * 60;
export const DEVICE_POLL_INTERVAL = 5;

// public  (CLI / device flow) — long-lived
export const ACCESS_TOKEN_EXPIRES_IN_PUBLIC = 8 * 60 * 60; // 8h
export const REFRESH_TOKEN_EXPIRES_IN_PUBLIC = 90 * 24 * 60 * 60; // 90d

// confidential (server-side apps) — short-lived
export const ACCESS_TOKEN_EXPIRES_IN_CONFIDENTIAL = 15 * 60; // 15m
export const REFRESH_TOKEN_EXPIRES_IN_CONFIDENTIAL = 30 * 24 * 60 * 60; // 30d

// backward-compat alias (gateway userMiddleware-д ашиглагдаж болно)
export const ACCESS_TOKEN_EXPIRES_IN = ACCESS_TOKEN_EXPIRES_IN_CONFIDENTIAL;
export const DEVICE_CODE_GRANT = 'urn:ietf:params:oauth:grant-type:device_code';
export const MAX_DEVICE_CODE_FAILED_ATTEMPTS = 5;
