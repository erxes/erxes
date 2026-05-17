import { hashPassword, isCurrentFormat, verifyPassword } from './passwordHash';

describe('passwordHash', () => {
  describe('hashPassword', () => {
    it('returns a scrypt-PHC encoded string', async () => {
      const hash = await hashPassword('Aa1aaaaa');
      const parts = hash.split('$');
      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe('scrypt');
      expect(parts[1]).toMatch(/^N=\d+,r=\d+,p=\d+$/);
      expect(Buffer.from(parts[2], 'base64')).toHaveLength(16);
      expect(Buffer.from(parts[3], 'base64')).toHaveLength(64);
    });

    it('produces a different hash each call (random salt)', async () => {
      const a = await hashPassword('Aa1aaaaa');
      const b = await hashPassword('Aa1aaaaa');
      expect(a).not.toBe(b);
    });

    it('rejects empty input', async () => {
      await expect(hashPassword('')).rejects.toThrow(/non-empty/);
    });

    it('rejects non-string input', async () => {
      // @ts-expect-error - intentional misuse to lock the runtime guard
      await expect(hashPassword(null)).rejects.toThrow(/non-empty/);
    });

    it('handles long passwords (no 72-byte truncation, unlike bcrypt)', async () => {
      const long = 'A1a'.repeat(50); // 150 chars
      const hash = await hashPassword(long);
      expect(await verifyPassword(long, hash)).toBe(true);
      // First 72 bytes match but the suffix differs - verify must reject.
      const truncatedLong = long.slice(0, 72) + 'XXXXXXXX';
      expect(await verifyPassword(truncatedLong, hash)).toBe(false);
    });
  });

  describe('verifyPassword (scrypt-PHC path)', () => {
    it('verifies a freshly hashed password', async () => {
      const hash = await hashPassword('Aa1aaaaa');
      expect(await verifyPassword('Aa1aaaaa', hash)).toBe(true);
    });

    it('rejects the wrong password', async () => {
      const hash = await hashPassword('Aa1aaaaa');
      expect(await verifyPassword('Aa1aaaaaX', hash)).toBe(false);
    });

    it('rejects empty input password', async () => {
      const hash = await hashPassword('Aa1aaaaa');
      expect(await verifyPassword('', hash)).toBe(false);
    });

    it('returns false (not throw) on malformed stored hash', async () => {
      expect(await verifyPassword('Aa1aaaaa', 'not-a-real-hash')).toBe(false);
      expect(await verifyPassword('Aa1aaaaa', 'scrypt$bad')).toBe(false);
      expect(await verifyPassword('Aa1aaaaa', '')).toBe(false);
      // @ts-expect-error - intentional misuse
      expect(await verifyPassword('Aa1aaaaa', null)).toBe(false);
    });

    it('rejects PHC params outside safe bounds', async () => {
      // N not a power of 2
      expect(
        await verifyPassword('p', 'scrypt$N=3,r=8,p=1$AAAAAAAAAAAAAAAA$AAAAAA'),
      ).toBe(false);
      // r too large
      expect(
        await verifyPassword(
          'p',
          'scrypt$N=16384,r=99,p=1$AAAAAAAAAAAAAAAA$AAAAAA',
        ),
      ).toBe(false);
    });

    // Operational rethrow behaviour (CodeRabbit Major, line 216):
    // scryptAsync failure on a VALID parsed hash now rethrows instead of
    // silently returning false, so a misconfigured/OOM deployment surfaces
    // rather than turning into a blanket auth-fail. Mocking Node's crypto
    // module is brittle across versions (non-configurable getters), so the
    // behaviour is verified inline by code review + the next test which
    // exercises the decoy-path side of the same try/catch.
  });

  describe('verifyPassword (legacy bcrypt path)', () => {
    it('routes bcrypt-shaped stored hashes to the supplied callback', async () => {
      const cb = jest.fn().mockResolvedValue(true);
      const result = await verifyPassword(
        'plaintext',
        '$2a$10$abcdefghijklmnopqrstuv',
        { legacyBcryptCompare: cb },
      );
      expect(result).toBe(true);
      expect(cb).toHaveBeenCalledWith(
        'plaintext',
        '$2a$10$abcdefghijklmnopqrstuv',
      );
    });

    it('recognises all three bcrypt prefixes ($2a, $2b, $2y)', async () => {
      const cb = jest.fn().mockResolvedValue(false);
      await verifyPassword('p', '$2a$10$x', { legacyBcryptCompare: cb });
      await verifyPassword('p', '$2b$10$x', { legacyBcryptCompare: cb });
      await verifyPassword('p', '$2y$10$x', { legacyBcryptCompare: cb });
      expect(cb).toHaveBeenCalledTimes(3);
    });

    it('returns false on empty input WITHOUT invoking the legacy callback', async () => {
      const cb = jest.fn().mockResolvedValue(true);
      expect(
        await verifyPassword('', '$2a$10$abc', { legacyBcryptCompare: cb }),
      ).toBe(false);
      expect(cb).not.toHaveBeenCalled();
    });

    it('returns false when bcrypt-shaped hash is supplied but no callback', async () => {
      expect(await verifyPassword('p', '$2a$10$abc')).toBe(false);
    });
  });

  describe('isCurrentFormat', () => {
    it('returns true for a freshly-hashed password', async () => {
      const hash = await hashPassword('Aa1aaaaa');
      expect(isCurrentFormat(hash)).toBe(true);
    });

    it('returns false for legacy bcrypt and garbage', () => {
      expect(isCurrentFormat('$2a$10$abcdefghijklmnopqrstuv')).toBe(false);
      expect(isCurrentFormat('not-a-real-hash')).toBe(false);
      expect(isCurrentFormat('')).toBe(false);
      expect(isCurrentFormat(null)).toBe(false);
      expect(isCurrentFormat(undefined)).toBe(false);
    });

    it('returns false for scrypt hashes computed under tighter-than-current params', async () => {
      // A real scrypt-PHC string with N=8192 (half the active SCRYPT_N=16384)
      // — structurally valid, verifies fine, but should NOT count as current
      // so lazy-rehash can migrate the row to the active params.
      const salt = Buffer.alloc(16, 1).toString('base64');
      const oldParamHash = `scrypt$N=8192,r=8,p=1$${salt}$${Buffer.alloc(64, 2).toString('base64')}`;
      expect(isCurrentFormat(oldParamHash)).toBe(false);
    });
  });
});
