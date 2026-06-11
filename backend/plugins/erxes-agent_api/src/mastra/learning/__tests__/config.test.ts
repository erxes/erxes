import {
  isLearningEnabled,
  learningCollectionName,
  resolveLearningTuning,
  learningTenant,
  hashSource,
  computeLearningStatus,
} from '../config';

describe('isLearningEnabled', () => {
  it('is on ONLY for the exact value "enable"', () => {
    expect(isLearningEnabled({ ERXES_AGENT_LEARNING: 'enable' })).toBe(true);
    expect(isLearningEnabled({ ERXES_AGENT_LEARNING: ' enable ' })).toBe(true);
    expect(isLearningEnabled({ ERXES_AGENT_LEARNING: 'true' })).toBe(false);
    expect(isLearningEnabled({ ERXES_AGENT_LEARNING: 'ENABLE' })).toBe(false);
    expect(isLearningEnabled({})).toBe(false);
  });
});

describe('learningCollectionName', () => {
  it('encodes model + dimension, separate from memory/knowledge collections', () => {
    expect(learningCollectionName('bge-small-en-v1.5', 384)).toBe(
      'mastra_learnings_bge_small_en_v1_5_384',
    );
  });
});

describe('resolveLearningTuning', () => {
  it('has safe defaults', () => {
    const t = resolveLearningTuning({});
    expect(t.autoPromoteMinSources).toBe(3);
    expect(t.autoPromoteMinConfidence).toBe(0.75);
    expect(t.mergeScore).toBe(0.9);
    expect(t.idleMinutes).toBe(30);
    expect(t.feedbackDownDelta).toBeLessThan(0);
  });

  it('reads overrides and ignores invalid values', () => {
    const t = resolveLearningTuning({
      ERXES_AGENT_LEARNING_K: '5',
      ERXES_AGENT_LEARNING_MIN_CONF: '0.9',
      ERXES_AGENT_LEARNING_IDLE_MINUTES: '-3',
    });
    expect(t.autoPromoteMinSources).toBe(5);
    expect(t.autoPromoteMinConfidence).toBe(0.9);
    expect(t.idleMinutes).toBe(30);
  });
});

describe('learningTenant', () => {
  it("pins 'os' for non-saas regardless of request subdomain", () => {
    expect(learningTenant('localhost', {})).toBe('os');
    expect(learningTenant(undefined, {})).toBe('os');
  });

  it('uses the org subdomain in saas mode (fail-closed without one)', () => {
    expect(learningTenant('acme', { VERSION: 'saas' })).toBe('acme');
    expect(learningTenant(undefined, { VERSION: 'saas' })).toBeUndefined();
  });
});

describe('hashSource', () => {
  it('is deterministic and not reversible to the input', () => {
    const a = hashSource('user-123', {});
    expect(hashSource('user-123', {})).toBe(a);
    expect(a).not.toContain('user-123');
    expect(a).toHaveLength(32);
  });

  it('distinguishes users and secrets', () => {
    expect(hashSource('user-123', {})).not.toBe(hashSource('user-456', {}));
    expect(hashSource('user-123', {})).not.toBe(
      hashSource('user-123', { ERXES_AGENT_LEARNING_HASH_SECRET: 'other' }),
    );
  });
});

describe('computeLearningStatus', () => {
  it('is all-null when disabled', () => {
    const s = computeLearningStatus({});
    expect(s.enabled).toBe(false);
    expect(s.collection).toBeNull();
  });

  it('surfaces collection + promotion floors when enabled', () => {
    const s = computeLearningStatus({ ERXES_AGENT_LEARNING: 'enable' });
    expect(s.enabled).toBe(true);
    expect(s.collection).toMatch(/^mastra_learnings_/);
    expect(s.autoPromoteMinSources).toBe(3);
  });
});
