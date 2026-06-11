import { augmentConvo, deriveResourceId, deriveBotResourceId } from '../convo';

describe('convo assembly', () => {
  const history = [
    { role: 'user', content: 'hi' },
    { role: 'assistant', content: 'hello' },
  ];

  it('AM-CONV-1: order is [wm?, recall?, ...history, user] with user last', () => {
    const convo = augmentConvo({
      recentHistory: history,
      userMessage: 'now',
      recallBlock: 'RECALL',
      workingMemoryBlock: 'WM',
    });
    expect(convo.map((m) => m.content)).toEqual([
      'WM',
      'RECALL',
      'hi',
      'hello',
      'now',
    ]);
    expect(convo[convo.length - 1]).toEqual({ role: 'user', content: 'now' });
  });

  it('AM-CONV-2: injected blocks are system role, never tool frames', () => {
    const convo = augmentConvo({
      recentHistory: [],
      userMessage: 'x',
      recallBlock: 'RECALL',
      workingMemoryBlock: 'WM',
    });
    const injected = convo.filter(
      (m) => m.content === 'WM' || m.content === 'RECALL',
    );
    expect(injected.every((m) => m.role === 'system')).toBe(true);
    // no tool-call frames anywhere
    expect(
      convo.some(
        (m: { role: string; tool_calls?: unknown }) =>
          m.role === 'tool' || m.tool_calls,
      ),
    ).toBe(false);
  });

  it('AM-CONV-3: both blocks absent → byte-identical to plain replay', () => {
    const convo = augmentConvo({ recentHistory: history, userMessage: 'now' });
    expect(convo).toEqual([...history, { role: 'user', content: 'now' }]);
  });

  it('AM-CONV-5: deriveResourceId uses user id, else per-agent fallback', () => {
    expect(deriveResourceId({ user: { _id: 'u1' }, agentId: 'a' })).toBe('u1');
    expect(deriveResourceId({ user: null, agentId: 'a' })).toBe('agent:a');
    expect(deriveResourceId({ agentId: 'a' })).toBe('agent:a');
  });

  it('AM-CONV-6: deriveBotResourceId prefers customer id, else per-conversation', () => {
    expect(
      deriveBotResourceId({ customerId: 'c1', conversationId: 'cv' }),
    ).toBe('c1');
    expect(deriveBotResourceId({ conversationId: 'cv' })).toBe('bot:cv');
    expect(
      deriveBotResourceId({ customerId: null, conversationId: 'cv' }),
    ).toBe('bot:cv');
  });
});
