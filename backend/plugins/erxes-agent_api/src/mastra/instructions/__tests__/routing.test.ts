/**
 * Spec tests for the always-loaded skill index (Level 1 of progressive
 * disclosure) in the system prompt. The contract:
 *
 *   - When the agent has skills, the prompt carries a "Skills" section listing
 *     each skill's name + when-to-use, and tells the model to load_skill before
 *     acting on a match.
 *   - The index never inlines the full playbook body — that is the whole point
 *     of progressive disclosure (the body arrives only via load_skill).
 *   - With no skills, no Skills section appears at all.
 *   - The Skills section precedes the agent's own custom instructions.
 */
import { buildSystemPrompt } from '../routing';

const baseOpts = {
  hasErxesTools: false,
  scopeLine: '',
  inventoryLines: [],
  builtins: [],
};

describe('buildSystemPrompt — skill index (Level 1)', () => {
  it('lists each skill by name and when-to-use, and instructs load_skill first', () => {
    const prompt = buildSystemPrompt('', {
      ...baseOpts,
      skills: [
        { name: 'refund-order', description: 'when a customer wants money back' },
        { name: 'close-deal', description: 'when a deal is ready to win' },
      ],
    });

    expect(prompt).toContain('Skills');
    expect(prompt).toContain('refund-order');
    expect(prompt).toContain('when a customer wants money back');
    expect(prompt).toContain('close-deal');
    expect(prompt).toContain('when a deal is ready to win');
    // The agent is told to pull the full instructions before acting.
    expect(prompt).toMatch(/load_skill/);
  });

  it('omits the Skills section entirely when there are no skills', () => {
    expect(buildSystemPrompt('', baseOpts)).not.toMatch(/##\s*Skills/);
    expect(
      buildSystemPrompt('', { ...baseOpts, skills: [] }),
    ).not.toMatch(/##\s*Skills/);
  });

  it('places the skill index before the agent custom instructions', () => {
    const prompt = buildSystemPrompt('Always greet the user by name.', {
      ...baseOpts,
      skills: [{ name: 'refund-order', description: 'money back' }],
    });
    const skillsAt = prompt.indexOf('Skills');
    const instructionsAt = prompt.indexOf('Always greet the user by name.');
    expect(skillsAt).toBeGreaterThanOrEqual(0);
    expect(instructionsAt).toBeGreaterThan(skillsAt);
  });
});
