import { spawnSync } from 'node:child_process';
import { buildAgentsInstructions } from '@/agents/agent';
import { buildAgentPluginContributions } from '@/agents/pluginContributions';

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(),
}));

const BODY_MARKER = 'Pipeline body marker: count deals per stage.';

it('mounts plugin skills below core instructions and loads them on demand', async () => {
  const {
    skills: [skill],
  } = await buildAgentPluginContributions(
    [
      {
        plugin: 'sales',
        agent: {
          skills: [
            {
              name: 'pipeline-analysis',
              description: 'Analyse deals by pipeline and stage.',
              instructions: BODY_MARKER,
            },
          ],
        },
      },
    ],
    new Map(),
  );
  const instructions = buildAgentsInstructions(new Date('2026-10-26'));

  // A separate process runs the real installed ESM Mastra runtime: a durable
  // agent with a dynamic skills resolver, as `buildBaseAgentsAgent` mounts it.
  const script = `
    import assert from 'node:assert/strict';
    import { Agent } from '@mastra/core/agent';
    import { createDurableAgent } from '@mastra/core/agent/durable';
    import { Mastra } from '@mastra/core/mastra';
    import { InMemoryStore } from '@mastra/core/storage';
    import { createSkill } from '@mastra/core/skills';
    import { MockLanguageModelV3 } from 'ai/test';
    const { skill: input, instructions, marker } = JSON.parse(process.env.SKILL_TEST);
    const skill = createSkill(input);
    const prompts = [];
    const usage = { inputTokens: { total: 1 }, outputTokens: { total: 1 } };
    const model = new MockLanguageModelV3({ doStream: async (options) => {
      const step = prompts.push(options) - 1;
      return { stream: new ReadableStream({ start(c) {
        if (step === 0) {
          c.enqueue({ type: 'tool-call', toolCallId: 'c1', toolName: 'skill', input: JSON.stringify({ name: skill.name }) });
          c.enqueue({ type: 'finish', finishReason: { unified: 'tool-calls', raw: 'tool_calls' }, usage });
        } else {
          c.enqueue({ type: 'text-start', id: 't' });
          c.enqueue({ type: 'text-delta', id: 't', delta: 'done' });
          c.enqueue({ type: 'text-end', id: 't' });
          c.enqueue({ type: 'finish', finishReason: { unified: 'stop', raw: 'stop' }, usage });
        }
        c.close();
      }})};
    }});
    const agent = createDurableAgent({ agent: new Agent({ id: 'skills', name: 'Skills', instructions, model, skills: async () => [skill] }) });
    const mastra = new Mastra({ agents: { test: agent }, storage: new InMemoryStore(), workers: false, logger: false });
    const run = await agent.stream('How is the sales pipeline doing?');
    for await (const chunk of run.output.fullStream) {}
    assert.equal(prompts.length, 2);
    const system = prompts[0].prompt.filter((m) => m.role === 'system').map((m) => m.content);
    const core = system.findIndex((c) => c.includes('Plugin skills:'));
    const catalog = system.findIndex((c) => c.includes('<available_skills>'));
    assert.ok(core >= 0 && catalog > core, 'core instructions precede the skills catalog');
    assert.ok(system[catalog].includes('<name>' + skill.name + '</name>'));
    assert.ok(system[catalog].includes(skill.description));
    assert.ok(!JSON.stringify(prompts[0].prompt).includes(marker), 'instructions load on demand');
    assert.ok(prompts[0].tools.some((tool) => tool.name === 'skill'));
    const loaded = JSON.stringify(prompts[1].prompt);
    assert.ok(loaded.includes(marker));
    assert.ok(loaded.includes('take precedence'));
    run.cleanup();
    await mastra.shutdown();
  `;
  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', script],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 15_000,
      env: {
        ...process.env,
        SKILL_TEST: JSON.stringify({
          skill: {
            name: skill.name,
            description: skill.description,
            instructions: skill.instructions,
          },
          instructions,
          marker: BODY_MARKER,
        }),
      },
    },
  );

  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
});
