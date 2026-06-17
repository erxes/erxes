import {
  isKnowledgeEnabled,
  knowledgeRefreshMinutes,
  isKnowledgeStale,
  knowledgeCollectionName,
  enabledKnowledgeTypes,
} from '../config';

describe('isKnowledgeEnabled', () => {
  it('is on ONLY for the exact value "enable"', () => {
    expect(isKnowledgeEnabled({ ERXES_AGENT_KNOWLEDGE: 'enable' })).toBe(true);
    expect(isKnowledgeEnabled({ ERXES_AGENT_KNOWLEDGE: ' enable ' })).toBe(true);
    expect(isKnowledgeEnabled({ ERXES_AGENT_KNOWLEDGE: 'true' })).toBe(false);
    expect(isKnowledgeEnabled({ ERXES_AGENT_KNOWLEDGE: 'ENABLE' })).toBe(false);
    expect(isKnowledgeEnabled({})).toBe(false);
  });
});

describe('knowledgeRefreshMinutes', () => {
  it('defaults to 60 and accepts positive-integer overrides', () => {
    expect(knowledgeRefreshMinutes({})).toBe(60);
    expect(
      knowledgeRefreshMinutes({ ERXES_AGENT_KNOWLEDGE_REFRESH_MINUTES: '15' }),
    ).toBe(15);
  });

  it('ignores non-positive / invalid values', () => {
    expect(
      knowledgeRefreshMinutes({ ERXES_AGENT_KNOWLEDGE_REFRESH_MINUTES: '0' }),
    ).toBe(60);
    expect(
      knowledgeRefreshMinutes({ ERXES_AGENT_KNOWLEDGE_REFRESH_MINUTES: '-5' }),
    ).toBe(60);
    expect(
      knowledgeRefreshMinutes({ ERXES_AGENT_KNOWLEDGE_REFRESH_MINUTES: 'abc' }),
    ).toBe(60);
  });
});

describe('isKnowledgeStale', () => {
  const now = 1_000_000_000_000;

  it('is stale when the corpus was never swept', () => {
    expect(isKnowledgeStale(null, now, {})).toBe(true);
    expect(isKnowledgeStale(undefined, now, {})).toBe(true);
  });

  it('is stale when the last sweep is older than the window', () => {
    expect(
      isKnowledgeStale(new Date(now - 61 * 60_000).toISOString(), now, {}),
    ).toBe(true);
  });

  it('is fresh within the window', () => {
    expect(isKnowledgeStale(new Date(now - 59 * 60_000), now, {})).toBe(false);
  });

  it('honors a custom window', () => {
    const env = { ERXES_AGENT_KNOWLEDGE_REFRESH_MINUTES: '10' };
    expect(isKnowledgeStale(new Date(now - 11 * 60_000), now, env)).toBe(true);
    expect(isKnowledgeStale(new Date(now - 9 * 60_000), now, env)).toBe(false);
  });

  it('treats an unparseable date as stale', () => {
    expect(isKnowledgeStale('not-a-date', now, {})).toBe(true);
  });
});

describe('knowledgeCollectionName', () => {
  it('encodes model + dimension', () => {
    expect(knowledgeCollectionName('text-embedding-3-large', 3072)).toBe(
      'mastra_knowledge_text_embedding_3_large_3072',
    );
  });
});

describe('enabledKnowledgeTypes', () => {
  it('defaults to kb-article only', () => {
    expect(enabledKnowledgeTypes(['kb-article', 'customer'], {})).toEqual([
      'kb-article',
    ]);
  });

  it('parses a comma list and drops unknown types', () => {
    expect(
      enabledKnowledgeTypes(['kb-article', 'customer'], {
        ERXES_AGENT_KNOWLEDGE_TYPES: 'kb-article, customer, bogus',
      }),
    ).toEqual(['kb-article', 'customer']);
  });
});
