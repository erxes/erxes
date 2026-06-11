import {
  buildWorkingMemoryBlock,
  mergeWorkingMemory,
  buildRefreshPrompt,
  buildRefreshUserContent,
} from '../workingMemory';

describe('working memory — pure helpers', () => {
  it('AM-WM-1: empty/null content → null block', () => {
    expect(buildWorkingMemoryBlock('')).toBeNull();
    expect(buildWorkingMemoryBlock(null)).toBeNull();
    expect(buildWorkingMemoryBlock('   ')).toBeNull();
  });

  it('AM-WM-2: builds a context block containing the profile, no tool frames', () => {
    const block = buildWorkingMemoryBlock('# Profile\n- Name: Sam') as string;
    expect(block).toContain('Sam');
    expect(block).not.toMatch(/tool_calls|<tool_call>|"function"/);
  });

  it('AM-WM-3: markdown merge uses replace semantics', () => {
    expect(mergeWorkingMemory('old profile', 'new profile')).toBe(
      'new profile',
    );
    // empty update keeps the existing profile
    expect(mergeWorkingMemory('old profile', '   ')).toBe('old profile');
    expect(mergeWorkingMemory('old profile', null)).toBe('old profile');
  });

  it('AM-WM-6: refresh prompt is a stateless system+user array, no tool frames', () => {
    const msgs = buildRefreshPrompt('# Profile\n- Name: Sam', {
      user: 'I moved to Berlin',
      assistant: 'Noted!',
    });
    expect(msgs.map((m) => m.role)).toEqual(['system', 'user']);
    expect(
      msgs.some(
        (m: { role: string; tool_calls?: unknown }) =>
          m.role === 'tool' || m.tool_calls,
      ),
    ).toBe(false);
    // user content carries the current profile + the exchange
    expect(msgs[1].content).toContain('Sam');
    expect(msgs[1].content).toContain('Berlin');
  });

  it('buildRefreshUserContent shows (empty) for a blank profile', () => {
    expect(
      buildRefreshUserContent('', { user: 'hi', assistant: 'hello' }),
    ).toContain('(empty)');
  });
});
