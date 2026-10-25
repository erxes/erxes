import { AGENT_SKILL_LIMITS, validateAgentPluginMeta } from './validate';

const skill = (overrides: Record<string, unknown> = {}) => ({
  name: 'pipeline-analysis',
  description: 'Analyse deals by pipeline and stage.',
  instructions: '# Pipeline analysis\n\n1. Count deals per stage.',
  ...overrides,
});

describe('validateAgentPluginMeta', () => {
  it('accepts nothing declared', () => {
    expect(validateAgentPluginMeta(undefined)).toEqual({
      skills: [],
      hiddenOperations: { queries: [], mutations: [] },
      rejections: [],
    });
  });

  it('accepts text skills and hidden operations', () => {
    const result = validateAgentPluginMeta({
      skills: [skill({ operations: ['salesStages', 'salesStages', 'deals'] })],
      hiddenOperations: { queries: ['cpDeals'], mutations: ['cpDealsAdd'] },
    });

    expect(result.rejections).toEqual([]);
    expect(result.skills).toEqual([
      { ...skill(), operations: ['salesStages', 'deals'] },
    ]);
    expect(result.hiddenOperations).toEqual({
      queries: ['cpDeals'],
      mutations: ['cpDealsAdd'],
    });
  });

  it('rejects a skill carrying code or tools while keeping the others', () => {
    const result = validateAgentPluginMeta({
      skills: [
        skill({ name: 'with-tool', tools: { run: {} } }),
        skill({ name: 'with-script', execute: () => undefined }),
        skill(),
      ],
    });

    expect(result.skills.map(({ name }) => name)).toEqual([
      'pipeline-analysis',
    ]);
    expect(result.rejections).toEqual([
      { skill: 'with-tool', reason: 'unsupported field(s) tools' },
      { skill: 'with-script', reason: 'unsupported field(s) execute' },
    ]);
  });

  it.each([
    ['an uppercase name', { name: 'Pipeline' }, 'name'],
    ['a namespaced name', { name: 'sales:pipeline' }, 'name'],
    [
      'a long name',
      { name: 'a'.repeat(AGENT_SKILL_LIMITS.maxNameLength + 1) },
      'name',
    ],
    ['an empty description', { description: '  ' }, 'description'],
    ['a multi-line description', { description: 'a\nb' }, 'description'],
    [
      'a long description',
      { description: 'a'.repeat(AGENT_SKILL_LIMITS.maxDescriptionLength + 1) },
      'description',
    ],
    [
      'long instructions',
      {
        instructions: 'a'.repeat(AGENT_SKILL_LIMITS.maxInstructionsLength + 1),
      },
      'instructions',
    ],
    ['control characters', { instructions: 'a\u0000b' }, 'instructions'],
    [
      'an invalid operation hint',
      { operations: ['deals { _id }'] },
      'operations',
    ],
  ])('rejects %s', (_label, overrides, field) => {
    const result = validateAgentPluginMeta({ skills: [skill(overrides)] });

    expect(result.skills).toEqual([]);
    expect(result.rejections).toHaveLength(1);
    expect(result.rejections[0].reason).toMatch(new RegExp(`^${field}`));
  });

  it('enforces the per-plugin skill count and unique names', () => {
    const result = validateAgentPluginMeta({
      skills: [
        skill(),
        skill(),
        ...Array.from(
          { length: AGENT_SKILL_LIMITS.maxSkillsPerPlugin },
          (_, i) => skill({ name: `skill-${i}` }),
        ),
      ],
    });

    expect(result.skills).toHaveLength(
      AGENT_SKILL_LIMITS.maxSkillsPerPlugin - 1,
    );
    expect(result.rejections).toEqual([
      { skill: 'pipeline-analysis', reason: 'duplicates another skill name' },
      {
        skill: `skill-${AGENT_SKILL_LIMITS.maxSkillsPerPlugin - 2}`,
        reason: `exceeds the limit of ${AGENT_SKILL_LIMITS.maxSkillsPerPlugin} skills per plugin`,
      },
      {
        skill: `skill-${AGENT_SKILL_LIMITS.maxSkillsPerPlugin - 1}`,
        reason: `exceeds the limit of ${AGENT_SKILL_LIMITS.maxSkillsPerPlugin} skills per plugin`,
      },
    ]);
  });

  it('rejects malformed hidden operations without dropping skills', () => {
    const tooMany = Array.from(
      { length: AGENT_SKILL_LIMITS.maxHiddenOperationsPerPlugin + 1 },
      (_, i) => `op${i}`,
    );

    for (const hiddenOperations of [
      { queries: ['not a name'] },
      { subscriptions: ['dealsChanged'] },
      { queries: tooMany },
    ]) {
      const result = validateAgentPluginMeta({
        skills: [skill()],
        hiddenOperations,
      });

      expect(result.skills).toHaveLength(1);
      expect(result.hiddenOperations).toEqual({ queries: [], mutations: [] });
      expect(result.rejections).toHaveLength(1);
      expect(result.rejections[0].reason).toMatch(/^hiddenOperations/);
    }
  });

  it('rejects metadata that is not an object', () => {
    expect(validateAgentPluginMeta('skills').rejections).toEqual([
      { reason: 'agent metadata Expected object, received string' },
    ]);
    expect(validateAgentPluginMeta({ skills: {} }).rejections).toEqual([
      { reason: 'agent metadata skills Expected array, received object' },
    ]);
  });
});
