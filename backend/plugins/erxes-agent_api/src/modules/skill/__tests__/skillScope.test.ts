/**
 * Spec tests for the agent-skill scope + fingerprint rules. The oracle is the
 * specification itself, stated independently in each test — NOT values copied
 * from the implementation:
 *
 *   - A skill is visible to an agent IFF it is enabled AND (global OR scoped to
 *     that agent). "Global" means an empty/absent agent list.
 *   - The index fingerprint changes iff the set of skills, their names, or their
 *     edit times change — and never depends on ordering.
 *   - A name normalises to a stable kebab-case slug.
 */
import {
  isSkillAvailableToAgent,
  normalizeSkillName,
  skillsFingerprint,
} from '@/skill/skillScope';

describe('isSkillAvailableToAgent — enabled AND (global OR scoped)', () => {
  it('makes a global skill (no agent list) visible to ANY agent', () => {
    const global = { isEnabled: true, agentIds: [] as string[] };
    expect(isSkillAvailableToAgent(global, 'agent-1')).toBe(true);
    expect(isSkillAvailableToAgent(global, 'agent-2')).toBe(true);
  });

  it('treats an absent agent list the same as global', () => {
    expect(isSkillAvailableToAgent({ isEnabled: true }, 'anyone')).toBe(true);
  });

  it('defaults a skill with no isEnabled flag to enabled', () => {
    expect(isSkillAvailableToAgent({ agentIds: [] }, 'anyone')).toBe(true);
  });

  it('shows a scoped skill ONLY to the agents it names', () => {
    const scoped = { isEnabled: true, agentIds: ['agent-1', 'agent-3'] };
    expect(isSkillAvailableToAgent(scoped, 'agent-1')).toBe(true);
    expect(isSkillAvailableToAgent(scoped, 'agent-3')).toBe(true);
    expect(isSkillAvailableToAgent(scoped, 'agent-2')).toBe(false);
  });

  it('hides a disabled skill from everyone, even the agent it is scoped to', () => {
    expect(
      isSkillAvailableToAgent({ isEnabled: false, agentIds: ['agent-1'] }, 'agent-1'),
    ).toBe(false);
    expect(
      isSkillAvailableToAgent({ isEnabled: false, agentIds: [] }, 'agent-1'),
    ).toBe(false);
  });
});

describe('normalizeSkillName — stable kebab-case slug', () => {
  it('lowercases, trims, and collapses runs of non-alphanumerics to single dashes', () => {
    expect(normalizeSkillName('  Refund a Paid Order!! ')).toBe(
      'refund-a-paid-order',
    );
    expect(normalizeSkillName('Close   Deal')).toBe('close-deal');
  });

  it('leaves an already-normalised slug unchanged', () => {
    expect(normalizeSkillName('refund-order')).toBe('refund-order');
  });

  it('strips leading and trailing separators', () => {
    expect(normalizeSkillName('--hello--')).toBe('hello');
    expect(normalizeSkillName('***')).toBe('');
  });
});

describe('skillsFingerprint — index identity, order-independent', () => {
  const a = { name: 'alpha', description: 'A', updatedAt: new Date(1000) };
  const b = { name: 'beta', description: 'B', updatedAt: new Date(2000) };

  it('marks an empty index distinctly', () => {
    expect(skillsFingerprint([])).toBe('none');
  });

  it('is identical regardless of input ordering', () => {
    expect(skillsFingerprint([a, b])).toBe(skillsFingerprint([b, a]));
  });

  it('changes when a skill is added or removed', () => {
    expect(skillsFingerprint([a])).not.toBe(skillsFingerprint([a, b]));
  });

  it('changes when a skill is renamed', () => {
    const renamed = { ...a, name: 'alpha-2' };
    expect(skillsFingerprint([a])).not.toBe(skillsFingerprint([renamed]));
  });

  it('changes when a skill is edited (updatedAt advances)', () => {
    const edited = { ...a, updatedAt: new Date(9999) };
    expect(skillsFingerprint([a])).not.toBe(skillsFingerprint([edited]));
  });

  it('is stable for the same index across calls', () => {
    expect(skillsFingerprint([a, b])).toBe(skillsFingerprint([a, b]));
  });
});
