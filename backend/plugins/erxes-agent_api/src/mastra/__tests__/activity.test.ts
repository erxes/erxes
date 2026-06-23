import {
  buildActivityContext,
  sanitizeActivity,
  createActivityTracker,
} from '../activity';

describe('buildActivityContext', () => {
  it('returns null when nothing is in flight', () => {
    expect(buildActivityContext({})).toBeNull();
    expect(buildActivityContext({ userMessage: 'hi' })).toBeNull();
  });

  it('includes the user request and the reasoning tail', () => {
    const ctx = buildActivityContext({
      userMessage: 'Find my open tickets',
      thinking: 'The user wants open tickets, I should query frontline',
    });
    expect(ctx).toContain('User request: Find my open tickets');
    expect(ctx).toContain('Agent reasoning (live tail):');
  });

  it('clips a long reasoning burst to its tail', () => {
    const ctx = buildActivityContext({
      thinking: `start ${'x'.repeat(2000)} end`,
    });
    expect(ctx).not.toContain('start');
    expect(ctx).toContain('…');
    expect(ctx).toContain('end');
  });

  it('describes the invoked tool with clipped args', () => {
    const ctx = buildActivityContext({
      toolName: 'searchCustomers',
      toolArgs: { name: 'John' },
    });
    expect(ctx).toContain('Invoking tool: searchCustomers');
    expect(ctx).toContain('"name":"John"');
  });
});

describe('sanitizeActivity', () => {
  it('keeps a clean line as-is', () => {
    expect(sanitizeActivity('Searching customers named John')).toBe(
      'Searching customers named John',
    );
  });

  it('strips quotes, prefixes, and trailing punctuation', () => {
    expect(sanitizeActivity('Status: "Looking up order #1042."')).toBe(
      'Looking up order #1042',
    );
  });

  it('keeps only the first line and collapses whitespace', () => {
    expect(sanitizeActivity('Comparing   plans\nand more text')).toBe(
      'Comparing plans',
    );
  });

  it('returns null for empty output', () => {
    expect(sanitizeActivity('')).toBeNull();
    expect(sanitizeActivity('   \n')).toBeNull();
    expect(sanitizeActivity(null)).toBeNull();
  });

  it('truncates overlong lines', () => {
    const out = sanitizeActivity('word '.repeat(60)) ?? '';
    expect(out.length).toBeLessThanOrEqual(81);
    expect(out.endsWith('…')).toBe(true);
  });
});

describe('createActivityTracker', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const flush = async () => {
    // run pending timers and let the summarize promise chain settle
    jest.runOnlyPendingTimers();
    await Promise.resolve();
    await Promise.resolve();
  };

  it('summarizes on a tool call and emits the result', async () => {
    const summarize = jest.fn().mockResolvedValue('Searching customers');
    const emit = jest.fn();
    const tracker = createActivityTracker({ summarize, emit });

    tracker.onToolCall('searchCustomers', { name: 'John' });
    await flush();

    expect(summarize).toHaveBeenCalledWith(
      expect.objectContaining({ toolName: 'searchCustomers' }),
    );
    expect(emit).toHaveBeenCalledWith('Searching customers');
    tracker.stop();
  });

  it('waits for enough new reasoning before summarizing', async () => {
    const summarize = jest.fn().mockResolvedValue('Thinking about tickets');
    const emit = jest.fn();
    const tracker = createActivityTracker({
      summarize,
      emit,
      minNewThinkingChars: 50,
    });

    tracker.onThinking('short');
    await flush();
    expect(summarize).not.toHaveBeenCalled();

    tracker.onThinking('x'.repeat(60));
    await flush();
    expect(summarize).toHaveBeenCalledTimes(1);
    tracker.stop();
  });

  it('does not re-emit an unchanged line', async () => {
    const summarize = jest.fn().mockResolvedValue('Same status');
    const emit = jest.fn();
    const tracker = createActivityTracker({
      summarize,
      emit,
      minIntervalMs: 0,
      minNewThinkingChars: 1,
    });

    tracker.onThinking('aaaa');
    await flush();
    tracker.onThinking('bbbb');
    await flush();

    expect(emit).toHaveBeenCalledTimes(1);
    tracker.stop();
  });

  it('never emits after stop', async () => {
    let resolve!: (v: string) => void;
    const summarize = jest.fn(() => new Promise<string>((r) => (resolve = r)));
    const emit = jest.fn();
    const tracker = createActivityTracker({ summarize, emit });

    tracker.onToolCall('slowTool');
    await flush();
    tracker.stop();
    resolve('Too late');
    await Promise.resolve();
    await Promise.resolve();

    expect(emit).not.toHaveBeenCalled();
  });
});
