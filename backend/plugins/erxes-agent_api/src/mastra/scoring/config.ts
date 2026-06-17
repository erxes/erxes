// ---------------------------------------------------------------------------
// Live evaluation + central observability — configuration (pure, env-driven).
//
// Deliberately a SMALL env surface — only two vars, on the client side:
//
//   ERXES_AGENT_EVALUATION=enable                 ← the single master switch
//   ERXES_AGENT_EVALUATION_DSN=https://<pk>:<sk>@langfuse.your-domain.com
//                                                 ← one string: URL + both keys
//
// The DSN (Sentry-style) is parsed into the Langfuse base URL + public/secret
// keys, so pointing every client at the one central server is a single
// copy-paste. Langfuse is a SEPARATE, central deployment — there is no
// "same host" default. Everything is OFF until the switch is `enable`.
// ---------------------------------------------------------------------------

export type Env = Record<string, string | undefined>;

export interface LangfuseConfig {
  baseUrl: string;
  publicKey: string;
  secretKey: string;
}

/** Read one env var as trimmed text (absent → empty string). */
function val(env: Env, key: string): string {
  return (env[key] ?? '').trim();
}

/**
 * The master switch. Evaluation is enabled ONLY when ERXES_AGENT_EVALUATION is
 * exactly "enable" (whitespace-trimmed) — every other value is off, mirroring
 * isAdvancedMemoryEnabled so the flag is unambiguous.
 */
export function isEvaluationEnabled(env: Env = process.env): boolean {
  return val(env, 'ERXES_AGENT_EVALUATION') === 'enable';
}

/**
 * Parse ERXES_AGENT_EVALUATION_DSN (`https://<publicKey>:<secretKey>@host[:port][/path]`)
 * into the Langfuse connection, or null when unset/invalid. No localhost
 * fallback: Langfuse is a remote central server, so without a valid DSN export
 * is simply off (scorers still compute; the caller warns) — we never silently
 * ship data nowhere.
 */
export function langfuseConfig(env: Env = process.env): LangfuseConfig | null {
  const dsn = val(env, 'ERXES_AGENT_EVALUATION_DSN');
  if (!dsn) return null;
  try {
    const u = new URL(dsn);
    const publicKey = decodeURIComponent(u.username);
    const secretKey = decodeURIComponent(u.password);
    if (!publicKey || !secretKey) return null;
    // Base URL = everything but the userinfo (supports path-prefixed installs).
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
    return { baseUrl: `${u.origin}${path}`, publicKey, secretKey };
  } catch {
    return null;
  }
}

/** True when evaluation is on AND a valid Langfuse DSN is set (i.e. scores will
 *  actually be exported centrally, not just computed locally). */
export function isExportConfigured(env: Env = process.env): boolean {
  return isEvaluationEnabled(env) && langfuseConfig(env) !== null;
}
