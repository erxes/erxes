import { makeRunner } from '../agentRunner';

// A spy agent recording which method was called and with what options.
function spyAgent() {
  const calls: { method: string; messages: unknown; options: unknown }[] = [];
  const record = (method: string) => (messages: unknown, options?: unknown) => {
    calls.push({ method, messages, options });
    return Promise.resolve(
      method.startsWith('stream') ? { fullStream: [] } : { text: method },
    );
  };
  return {
    calls,
    generate: record('generate'),
    generateLegacy: record('generateLegacy'),
    stream: record('stream'),
    streamLegacy: record('streamLegacy'),
  };
}

describe('makeRunner', () => {
  it('dispatches to the native methods when not legacy', async () => {
    const agent = spyAgent();
    const runner = makeRunner(agent, false);

    await runner.generate(['hi']);
    await runner.stream(['hi']);

    expect(agent.calls.map((c) => c.method)).toEqual(['generate', 'stream']);
  });

  it('dispatches to the legacy methods when legacy', async () => {
    const agent = spyAgent();
    const runner = makeRunner(agent, true);

    await runner.generate(['hi']);
    await runner.stream(['hi']);

    expect(agent.calls.map((c) => c.method)).toEqual([
      'generateLegacy',
      'streamLegacy',
    ]);
  });

  // Regression: one-shot synthesis/titler/extractor calls pass { maxSteps: 1 }.
  // Before the runner, the legacy branch received no options, so those calls ran
  // with the agent's full step budget and could loop into tool calls.
  it('forwards options to the legacy path too', async () => {
    const agent = spyAgent();
    const runner = makeRunner(agent, true);

    await runner.generate(['hi'], { maxSteps: 1 });

    expect(agent.calls[0].method).toBe('generateLegacy');
    expect(agent.calls[0].options).toEqual({ maxSteps: 1 });
  });

  it('forwards the abort signal on the legacy stream path', async () => {
    const agent = spyAgent();
    const runner = makeRunner(agent, true);
    const abortSignal = new AbortController().signal;

    await runner.stream(['hi'], { abortSignal });

    expect(agent.calls[0].method).toBe('streamLegacy');
    expect(agent.calls[0].options).toEqual({ abortSignal });
  });
});
