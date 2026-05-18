import * as crypto from 'crypto';

// ---------------------------------------------------------------------------
// Password hashing helper (CWE-916 / js/insufficient-password-hash).
//
// Stores password-equivalent secrets using Node's built-in `crypto.scrypt`
// (no extra dependency) with PHC-style encoding:
//     `scrypt$N=...,r=...,p=...$<salt-b64>$<hash-b64>`
//
// The N/r/p parameters are embedded in the stored hash so any future
// tightening of `SCRYPT_N` etc. remains backward-compatible with hashes
// already stored under the prior parameters.
//
// `verifyPassword` accepts an optional `legacyBcryptCompare` callback so a
// caller migrating away from `bcrypt(hash(password))` can keep accepting
// existing user logins until those rows are silently re-hashed to the new
// format. erxes-api-shared intentionally does not depend on bcryptjs —
// that decision stays with the caller.
// ---------------------------------------------------------------------------

const scryptAsync = (
  password: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  keylen: number,
  options: crypto.ScryptOptions,
): Promise<Buffer> =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password, salt, keylen, options, (err, derived) =>
      err ? reject(err) : resolve(derived as Buffer),
    ),
  );

// Tunable, but values must stay inside the bounds enforced by
// `parseScryptParams` below: N must be a power of 2 >= 2, r in [1,32],
// p in [1,16], and 128*N*r*p must fit under SCRYPT_MAXMEM_CAP (1 GiB).
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LEN = 64;
const SCRYPT_SALT_LEN = 16;

// Node's default scrypt maxmem is 32 MiB and the runtime rejects calls when
// roughly `128 * N * r * p > maxmem`. We size maxmem from the actual params
// so future tuning of N or r doesn't trip ERR_CRYPTO_INVALID_SCRYPT_PARAMS,
// but we also cap maxmem to prevent a malformed stored hash from requesting
// absurd memory. 1 GiB is well above any sane production parameter set.
const SCRYPT_MAXMEM_CAP = 1024 * 1024 * 1024;

const scryptMaxmem = (N: number, r: number, p: number): number =>
  Math.min(SCRYPT_MAXMEM_CAP, Math.max(32 * 1024 * 1024, 256 * N * r * p));

const PHC_PARAMS_RE = /^N=(\d+),r=(\d+),p=(\d+)$/;

const parseScryptParams = (
  paramStr: string,
): { N: number; r: number; p: number } | null => {
  const m = PHC_PARAMS_RE.exec(paramStr);
  if (!m) return null;
  const N = Number(m[1]);
  const r = Number(m[2]);
  const p = Number(m[3]);
  // N must be a power of 2 >= 2 (scrypt cost factor); r and p kept in sane
  // bounds so a malformed stored hash can't request gigabytes of memory.
  if (!Number.isInteger(N) || N < 2 || (N & (N - 1)) !== 0) return null;
  if (!Number.isInteger(r) || r < 1 || r > 32) return null;
  if (!Number.isInteger(p) || p < 1 || p > 16) return null;
  if (128 * N * r * p > SCRYPT_MAXMEM_CAP) return null;
  return { N, r, p };
};

interface IParsedStoredHash {
  params: { N: number; r: number; p: number };
  salt: Buffer;
  expected: Buffer;
}

// Decode a PHC-encoded `scrypt$N=...,r=...,p=...$<salt>$<hash>` stored hash.
// Returns null on any malformedness so the caller can pick the constant-time
// decoy path instead of returning false early (which would leak via timing).
//
// Defensive checks here mirror the structural guarantees `hashPassword`
// emits - canonical salt = 16 raw bytes, derived key = 64 raw bytes - so a
// corrupted stored hash can never drive an oversized `Buffer.from`
// allocation, an off-spec scrypt `keylen`, or out-of-bounds N/r/p.
const parseStoredHash = (storedHash: unknown): IParsedStoredHash | null => {
  if (typeof storedHash !== 'string') return null;
  const parts = storedHash.split('$');
  if (parts.length !== 4) return null;
  if (parts[0] !== 'scrypt') return null;
  // Reject pathologically large base64 payloads BEFORE decoding. Canonical
  // sizes are 16 raw bytes (<=24 base64 chars) for salt and 64 raw bytes
  // (<=88 base64 chars) for the derived key.
  if (parts[2].length > 32) return null;
  if (parts[3].length > 128) return null;
  const params = parseScryptParams(parts[1]);
  if (params === null) return null;
  const salt = Buffer.from(parts[2], 'base64');
  if (salt.length !== SCRYPT_SALT_LEN) return null;
  const expected = Buffer.from(parts[3], 'base64');
  if (expected.length !== SCRYPT_KEY_LEN) return null;
  return { params, salt, expected };
};

// Constant-time decoy salt used to mask the timing difference between a
// well-formed verify (runs scrypt) and a malformed/empty-input attempt
// (would otherwise return instantly). Generated once at module load; its
// value never needs to be secret - only stable so the decoy CPU cost
// matches a real verify.
const SCRYPT_DECOY_SALT = crypto.randomBytes(SCRYPT_SALT_LEN);

/**
 * Hash a plaintext password using scrypt with PHC encoding.
 *
 * Returns a self-describing string `scrypt$N=...,r=...,p=...$<salt>$<hash>`
 * suitable for persistence; the parameters are read back by `verifyPassword`
 * so historical hashes remain verifiable after future param tuning.
 *
 * Throws if `password` is not a non-empty string, or if scrypt fails (which
 * indicates a deployment misconfiguration - the inputs are server-controlled).
 */
export const hashPassword = async (password: string): Promise<string> => {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('password must be a non-empty string');
  }
  const N = SCRYPT_N;
  const r = SCRYPT_R;
  const p = SCRYPT_P;
  const salt = crypto.randomBytes(SCRYPT_SALT_LEN);
  let derived: Buffer;
  try {
    derived = await scryptAsync(password, salt, SCRYPT_KEY_LEN, {
      N,
      r,
      p,
      maxmem: scryptMaxmem(N, r, p),
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'unknown';
    throw new Error(`Failed to hash password with scrypt: ${reason}`);
  }
  return [
    'scrypt',
    `N=${N},r=${r},p=${p}`,
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$');
};

export interface IVerifyPasswordOptions {
  /**
   * Optional verifier for stored hashes in a legacy bcrypt-shaped format
   * (i.e. starting with `$2a$`, `$2b$`, `$2y$`). Called with the raw
   * plaintext password and the stored hash; must return a boolean.
   *
   * Use this when migrating away from a previous password-hashing scheme:
   * new writes go through `hashPassword` (scrypt), but existing rows still
   * authenticate via the supplied callback until they're re-hashed.
   *
   * If omitted, stored hashes that look bcrypt-shaped return `false`.
   */
  legacyBcryptCompare?: (
    password: string,
    storedHash: string,
  ) => Promise<boolean>;
}

/**
 * Verify a plaintext password against a stored hash produced by
 * `hashPassword` (or by an opt-in legacy bcrypt verifier).
 *
 * Timing-uniform: every code path runs scrypt against the input and ends in
 * a `timingSafeEqual` call, so a caller cannot distinguish empty-input,
 * malformed-stored-hash, and real-mismatch by latency.
 */
export const verifyPassword = async (
  password: string,
  storedHash: string,
  options: IVerifyPasswordOptions = {},
): Promise<boolean> => {
  const looksLikeBcrypt =
    typeof storedHash === 'string' &&
    (storedHash.startsWith('$2a$') ||
      storedHash.startsWith('$2b$') ||
      storedHash.startsWith('$2y$'));

  if (looksLikeBcrypt && options.legacyBcryptCompare) {
    if (typeof password !== 'string' || password.length === 0) {
      // Empty input always fails - but still pay roughly the cost of one
      // scrypt to avoid a fast-path oracle on input shape.
      await runDecoyScrypt(password);
      return false;
    }
    return options.legacyBcryptCompare(password, storedHash);
  }

  // Non-bcrypt path: parse as scrypt-PHC, always run scrypt (decoy on
  // invalid input), end in timingSafeEqual.
  const secretValid = typeof password === 'string' && password.length > 0;
  const parsed = parseStoredHash(storedHash);
  const inputValid = secretValid && parsed !== null;

  const params = parsed?.params ?? { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P };
  const salt = parsed?.salt ?? SCRYPT_DECOY_SALT;
  const keylen = parsed?.expected.length ?? SCRYPT_KEY_LEN;
  const secretInput = typeof password === 'string' ? password : '';

  let derived: Buffer;
  try {
    derived = await scryptAsync(secretInput, salt, keylen, {
      N: params.N,
      r: params.r,
      p: params.p,
      maxmem: scryptMaxmem(params.N, params.r, params.p),
    });
  } catch (error) {
    // On the decoy / malformed-hash path (parsed === null) scrypt failure
    // is expected — return false to keep the timing-uniform auth-fail
    // outcome. On the valid-input path it's an operational failure (OOM,
    // ERR_CRYPTO_INVALID_SCRYPT_PARAMS, etc.) and silently treating it as
    // a wrong password would hide an unhealthy deployment; rethrow so the
    // caller surfaces a real error.
    if (parsed === null) return false;
    const reason = error instanceof Error ? error.message : 'unknown';
    throw new Error(`Failed to verify password with scrypt: ${reason}`);
  }

  if (inputValid && parsed !== null) {
    return crypto.timingSafeEqual(derived, parsed.expected);
  }

  // Decoy comparison against a same-length zero buffer to keep the
  // `timingSafeEqual` cost identical to a real verify.
  crypto.timingSafeEqual(derived, Buffer.alloc(derived.length));
  return false;
};

// Used on the bcrypt-empty-input path so an attacker can't tell empty-password
// (returns false immediately) from real-password (delegates to bcrypt, ~50ms)
// by latency alone.
const runDecoyScrypt = async (password: unknown): Promise<void> => {
  const input = typeof password === 'string' ? password : '';
  try {
    await scryptAsync(input, SCRYPT_DECOY_SALT, SCRYPT_KEY_LEN, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      maxmem: scryptMaxmem(SCRYPT_N, SCRYPT_R, SCRYPT_P),
    });
  } catch {
    // Decoy failure is harmless - the function returns void either way.
  }
};

/**
 * `true` iff `storedHash` is recognised by `verifyPassword` as the
 * current (scrypt-PHC) format AND its embedded params match the active
 * module constants. Useful for callers that want to lazily re-hash on
 * successful login: when `SCRYPT_N`/`SCRYPT_R`/`SCRYPT_P` are tightened
 * later, older scrypt rows return `false` here and the caller re-hashes
 * them to the new params. Returns `false` for legacy bcrypt rows so
 * those are migrated too.
 */
export const isCurrentFormat = (storedHash: unknown): boolean => {
  const parsed = parseStoredHash(storedHash);
  return (
    parsed !== null &&
    parsed.params.N === SCRYPT_N &&
    parsed.params.r === SCRYPT_R &&
    parsed.params.p === SCRYPT_P
  );
};
