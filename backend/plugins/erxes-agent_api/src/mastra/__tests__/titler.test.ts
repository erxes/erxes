import { shouldGenerateTitle, sanitizeTitle } from '../titler';

describe('shouldGenerateTitle', () => {
  it('generates on the first completed exchange (derived title)', () => {
    expect(
      shouldGenerateTitle({ titleSource: 'derived', messageCount: 2 }),
    ).toBe(true);
  });

  it('generates for legacy threads with no titleSource', () => {
    expect(shouldGenerateTitle({ messageCount: 2 })).toBe(true);
  });

  it('never overwrites a manual rename', () => {
    expect(
      shouldGenerateTitle({ titleSource: 'manual', messageCount: 100 }),
    ).toBe(false);
  });

  it('does not regenerate right after generating', () => {
    expect(
      shouldGenerateTitle({
        titleSource: 'generated',
        titleMessageCount: 2,
        messageCount: 4,
      }),
    ).toBe(false);
  });

  it('refreshes once the conversation has grown enough', () => {
    expect(
      shouldGenerateTitle({
        titleSource: 'generated',
        titleMessageCount: 2,
        messageCount: 8,
      }),
    ).toBe(true);
  });
});

describe('sanitizeTitle', () => {
  it('strips wrapping quotes and trailing punctuation', () => {
    expect(sanitizeTitle('"Lead follow-up workflow."')).toBe(
      'Lead follow-up workflow',
    );
  });

  it('strips a Title: prefix and keeps only the first line', () => {
    expect(sanitizeTitle('Title: Sales pipeline setup\nExtra commentary')).toBe(
      'Sales pipeline setup',
    );
  });

  it('returns null for empty output', () => {
    expect(sanitizeTitle('   ')).toBeNull();
    expect(sanitizeTitle(null)).toBeNull();
  });

  it('caps overly long titles', () => {
    const title = sanitizeTitle('word '.repeat(30)) ?? '';
    expect(title.length).toBeLessThanOrEqual(61);
    expect(title.endsWith('…')).toBe(true);
  });
});
