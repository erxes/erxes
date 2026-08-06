import {
  scrubPII,
  wasRedacted,
  parseGateVerdicts,
  buildGateUserContent,
  REDACTED,
} from '../sanitize';

describe('scrubPII', () => {
  it('redacts email addresses', () => {
    const out = scrubPII('Contact bat.bold@example.com for help');
    expect(out).not.toContain('bat.bold@example.com');
    expect(out).toContain(REDACTED);
  });

  it('redacts phone numbers with separators', () => {
    const out = scrubPII('Call +976 9911-2233 today');
    expect(out).not.toContain('9911');
    expect(out).toContain(REDACTED);
  });

  it('keeps short numeric quantities', () => {
    const out = scrubPII('The plan costs 49000 MNT per month');
    expect(out).toContain('49000');
    expect(out).not.toContain(REDACTED);
  });

  it('redacts long hex tokens (api keys, mongo ids)', () => {
    const out = scrubPII('record 5f2b9c1d3e4a5b6c7d8e9f0a1b2c3d4e');
    expect(out).not.toContain('5f2b9c1d3e4a5b6c7d8e9f0a');
    expect(out).toContain(REDACTED);
  });

  it('strips query strings from URLs (token-bearing params)', () => {
    const out = scrubPII(
      'See https://app.erxes.io/deals?token=secret123&x=1 for details',
    );
    expect(out).toContain('https://app.erxes.io/deals');
    expect(out).not.toContain('secret123');
  });

  it('leaves clean general statements untouched', () => {
    const text = 'Refund requests must be filed within 14 days of purchase.';
    expect(scrubPII(text)).toBe(text);
  });

  it('handles empty/nullish input', () => {
    expect(scrubPII('')).toBe('');
    expect(scrubPII(undefined as unknown as string)).toBe('');
  });
});

describe('wasRedacted', () => {
  it('detects redaction marks', () => {
    expect(wasRedacted(`call ${REDACTED}`)).toBe(true);
    expect(wasRedacted('all clear')).toBe(false);
  });
});

describe('parseGateVerdicts (fail-closed)', () => {
  it('parses a clean boolean array', () => {
    expect(parseGateVerdicts('[true, false, true]', 3)).toEqual([
      true,
      false,
      true,
    ]);
  });

  it('tolerates surrounding prose', () => {
    expect(parseGateVerdicts('Here you go: [true, true]', 2)).toEqual([
      true,
      true,
    ]);
  });

  it('drops everything on length mismatch', () => {
    expect(parseGateVerdicts('[true]', 3)).toEqual([false, false, false]);
  });

  it('drops everything on non-boolean entries', () => {
    expect(parseGateVerdicts('["yes", "no"]', 2)).toEqual([false, false]);
  });

  it('drops everything on garbage', () => {
    expect(parseGateVerdicts('not json at all', 2)).toEqual([false, false]);
    expect(parseGateVerdicts('', 2)).toEqual([false, false]);
  });
});

describe('buildGateUserContent', () => {
  it('numbers the candidates and states the expected count', () => {
    const content = buildGateUserContent(['lesson a', 'lesson b']);
    expect(content).toContain('1. lesson a');
    expect(content).toContain('2. lesson b');
    expect(content).toContain('exactly 2 booleans');
  });
});
