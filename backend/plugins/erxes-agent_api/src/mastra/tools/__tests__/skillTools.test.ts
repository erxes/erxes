/**
 * Contract tests for the load_skill tool (Level 2 of progressive disclosure).
 * The Mastra tool wrapper is mocked so each tool's `execute` is directly
 * callable; the model layer is a hand-built fake so we assert the tool's
 * behaviour, not Mongo's:
 *
 *   - A known, in-scope skill returns its full body as `instructions`.
 *   - An unknown/out-of-scope name returns found:false plus the available names
 *     (so a mistyped name self-corrects instead of dead-ending).
 *   - Loading a skill records a best-effort usage hit; a miss records nothing.
 */
jest.mock('@mastra/core/tools', () => ({
  createTool: (cfg: unknown) => cfg,
}));

import { buildSkillTools } from '../skillTools';
import type { IModels } from '~/connectionResolvers';

const asTool = <TResult>(tool: unknown) =>
  tool as { execute: (input: Record<string, unknown>) => Promise<TResult> };

interface LoadResult {
  found: boolean;
  name?: string;
  title?: string;
  instructions?: string;
  error?: string;
  available?: string[];
}

const REFUND_SKILL = {
  _id: 'skill-1',
  name: 'refund-order',
  title: 'Refund a paid order',
  body: '1. Find the order. 2. Issue the refund. 3. Notify the customer.',
};

const buildFakeModels = () => {
  const findForAgentByName = jest.fn((_agentId: string, name: string) =>
    Promise.resolve(name === REFUND_SKILL.name ? REFUND_SKILL : null),
  );
  const recordSkillUse = jest.fn(() => Promise.resolve());
  const models = {
    MastraAgentSkill: { findForAgentByName, recordSkillUse },
  } as unknown as IModels;
  return { models, findForAgentByName, recordSkillUse };
};

const makeTool = (overrides?: { availableNames?: string[] }) => {
  const fake = buildFakeModels();
  const { load_skill } = buildSkillTools({
    models: fake.models,
    agentId: 'agent-1',
    availableNames: overrides?.availableNames ?? ['refund-order', 'close-deal'],
  });
  return { tool: load_skill, ...fake };
};

describe('load_skill', () => {
  it('returns the full playbook body for a known, in-scope skill', async () => {
    const { tool, findForAgentByName, recordSkillUse } = makeTool();
    const res = await asTool<LoadResult>(tool).execute({ name: 'refund-order' });

    expect(res.found).toBe(true);
    expect(res.name).toBe('refund-order');
    expect(res.title).toBe('Refund a paid order');
    expect(res.instructions).toBe(REFUND_SKILL.body);
    // It looked the skill up scoped to THIS agent.
    expect(findForAgentByName).toHaveBeenCalledWith('agent-1', 'refund-order');
    // And recorded a usage hit against the resolved skill.
    expect(recordSkillUse).toHaveBeenCalledWith('skill-1');
  });

  it('reports a miss with the available names and records no usage', async () => {
    const { tool, recordSkillUse } = makeTool();
    const res = await asTool<LoadResult>(tool).execute({ name: 'nope' });

    expect(res.found).toBe(false);
    expect(res.error).toMatch(/nope/);
    expect(res.available).toEqual(['refund-order', 'close-deal']);
    expect(recordSkillUse).not.toHaveBeenCalled();
  });
});
