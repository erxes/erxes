import { shouldGenerateTitle, buildTranscript, sanitizeTitle } from '../titler';

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

describe('buildTranscript', () => {
  it('labels roles and collapses whitespace', () => {
    const transcript = buildTranscript([
      { role: 'user', content: 'build me\n a workflow' },
      { role: 'assistant', content: 'Sure,  here is one' },
    ]);
    expect(transcript).toBe(
      'User: build me a workflow\nAssistant: Sure, here is one',
    );
  });

  it('clips long messages and keeps only the trailing window', () => {
    const long = 'x'.repeat(500);
    const msgs = Array.from({ length: 20 }, (_, i) => ({
      role: 'user',
      content: i === 19 ? long : `msg ${i}`,
    }));
    const transcript = buildTranscript(msgs);
    expect(transcript.split('\n')).toHaveLength(12);
    expect(transcript).toContain('…');
    expect(transcript).not.toContain('msg 0');
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
