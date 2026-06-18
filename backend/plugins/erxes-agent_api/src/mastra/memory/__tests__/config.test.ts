import {
  isAdvancedMemoryEnabled,
  resolveEmbedderConfig,
  collectionName,
  resolveRecallTuning,
  computeAdvancedMemoryStatus,
} from '../config';

describe('advanced-memory config', () => {
  // ── Feature flag (AM-FLAG-1..4) ──────────────────────────────────────────
  describe('isAdvancedMemoryEnabled', () => {
    it('AM-FLAG-1: defaults to enabled when unset', () => {
      expect(isAdvancedMemoryEnabled({})).toBe(true);
    });

    it('AM-FLAG-2: false only for exact "disable"', () => {
      expect(isAdvancedMemoryEnabled({ ERXES_AGENT_MEMORY: 'disable' })).toBe(
        false,
      );
    });

    it('AM-FLAG-3: other values leave it enabled', () => {
      for (const v of ['enable', 'true', '1', 'on', 'DISABLE', 'disabled', 'no']) {
        expect(isAdvancedMemoryEnabled({ ERXES_AGENT_MEMORY: v })).toBe(true);
      }
    });

    it('AM-FLAG-4: trims surrounding whitespace', () => {
      expect(
        isAdvancedMemoryEnabled({ ERXES_AGENT_MEMORY: '  disable  ' }),
      ).toBe(false);
    });
  });

  // ── Embedder resolution (AM-EMB-1..4) ────────────────────────────────────
  describe('resolveEmbedderConfig', () => {
    it('AM-EMB-1: fastembed default', () => {
      expect(resolveEmbedderConfig({})).toEqual({
        kind: 'fastembed',
        model: 'bge-small-en-v1.5',
        dimension: 384,
      });
    });

    it('AM-EMB-2: openai defaults', () => {
      expect(resolveEmbedderConfig({ ERXES_AGENT_EMBEDDER: 'openai' })).toEqual(
        {
          kind: 'openai',
          model: 'text-embedding-3-small',
          dimension: 1536,
          baseUrl: 'https://api.openai.com/v1',
        },
      );
    });

    it('AM-EMB-3: openai large model resolves to 3072 dims', () => {
      const cfg = resolveEmbedderConfig({
        ERXES_AGENT_EMBEDDER: 'openai',
        ERXES_AGENT_EMBEDDER_MODEL: 'text-embedding-3-large',
      });
      expect(cfg.dimension).toBe(3072);
    });

    it('AM-EMB-4: unknown kind falls back to fastembed with a warning', () => {
      const warn = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);
      const cfg = resolveEmbedderConfig({ ERXES_AGENT_EMBEDDER: 'cohere' });
      expect(cfg.kind).toBe('fastembed');
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('openai picks up base url + api key when provided', () => {
      const cfg = resolveEmbedderConfig({
        ERXES_AGENT_EMBEDDER: 'openai',
        ERXES_AGENT_EMBEDDER_BASE_URL: 'https://proxy.local/v1',
        ERXES_AGENT_EMBEDDER_API_KEY: 'sk-test',
      });
      expect(cfg.baseUrl).toBe('https://proxy.local/v1');
      expect(cfg.apiKey).toBe('sk-test');
    });
  });

  // ── Collection naming (AM-COL-1/2) ───────────────────────────────────────
  describe('collectionName', () => {
    it('AM-COL-1: sanitizes model and suffixes the dimension', () => {
      expect(collectionName('bge-small-en-v1.5', 384)).toBe(
        'mastra_memory_bge_small_en_v1_5_384',
      );
    });

    it('AM-COL-2: different embedder yields a distinct collection', () => {
      const first = collectionName('bge-small-en-v1.5', 384);
      const second = collectionName('text-embedding-3-small', 1536);
      expect(second).toBe('mastra_memory_text_embedding_3_small_1536');
      expect(first).not.toBe(second);
    });
  });

  // ── Recall tuning (AM-REC-5) ─────────────────────────────────────────────
  describe('resolveRecallTuning', () => {
    it('AM-REC-5: parses valid values', () => {
      expect(
        resolveRecallTuning({
          ERXES_AGENT_MEMORY_TOPK: '7',
          ERXES_AGENT_MEMORY_MIN_SCORE: '0.3',
        }),
      ).toEqual({ topK: 7, minScore: 0.3, scope: 'resource' });
    });

    it('AM-REC-5: garbage values fall back to defaults', () => {
      expect(
        resolveRecallTuning({
          ERXES_AGENT_MEMORY_TOPK: 'abc',
          ERXES_AGENT_MEMORY_MIN_SCORE: '9',
          ERXES_AGENT_MEMORY_SCOPE: 'banana',
        }),
      ).toEqual({ topK: 4, minScore: 0.5, scope: 'resource' });
    });

    it('honors thread scope', () => {
      expect(
        resolveRecallTuning({ ERXES_AGENT_MEMORY_SCOPE: 'thread' }).scope,
      ).toBe('thread');
    });
  });

  // ── Status (AM-SET-1/2) ──────────────────────────────────────────────────
  describe('computeAdvancedMemoryStatus', () => {
    it('AM-SET-1: disabled → all details null', () => {
      expect(
        computeAdvancedMemoryStatus({ ERXES_AGENT_MEMORY: 'disable' }),
      ).toEqual({
        enabled: false,
        embedder: null,
        embedderModel: null,
        qdrantUrl: null,
        qdrantReachable: null,
        collection: null,
      });
    });

    it('AM-SET-2: enabled → reports embedder, qdrant, collection', () => {
      expect(
        computeAdvancedMemoryStatus(
          { ERXES_AGENT_MEMORY: 'enable' },
          { reachable: true },
        ),
      ).toMatchObject({
        enabled: true,
        embedder: 'fastembed',
        qdrantReachable: true,
        collection: 'mastra_memory_bge_small_en_v1_5_384',
      });
    });

    it('qdrantReachable is null until a health check runs', () => {
      const status = computeAdvancedMemoryStatus({
        ERXES_AGENT_MEMORY: 'enable',
      });
      expect(status.enabled).toBe(true);
      expect(status.qdrantReachable).toBeNull();
    });
  });
});
