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
    it('AM-FLAG-1: defaults to false when unset', () => {
      expect(isAdvancedMemoryEnabled({})).toBe(false);
    });

    it('AM-FLAG-2: true only for exact "enable"', () => {
      expect(isAdvancedMemoryEnabled({ MASTRA_MEMORY: 'enable' })).toBe(true);
    });

    it('AM-FLAG-3: other truthy-looking values are off', () => {
      for (const v of ['true', '1', 'on', 'ENABLE', 'enabled', 'yes']) {
        expect(isAdvancedMemoryEnabled({ MASTRA_MEMORY: v })).toBe(false);
      }
    });

    it('AM-FLAG-4: trims surrounding whitespace', () => {
      expect(isAdvancedMemoryEnabled({ MASTRA_MEMORY: '  enable  ' })).toBe(true);
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
      expect(resolveEmbedderConfig({ MASTRA_EMBEDDER: 'openai' })).toEqual({
        kind: 'openai',
        model: 'text-embedding-3-small',
        dimension: 1536,
        baseUrl: 'https://api.openai.com/v1',
      });
    });

    it('AM-EMB-3: openai large model resolves to 3072 dims', () => {
      const cfg = resolveEmbedderConfig({
        MASTRA_EMBEDDER: 'openai',
        MASTRA_EMBEDDER_MODEL: 'text-embedding-3-large',
      });
      expect(cfg.dimension).toBe(3072);
    });

    it('AM-EMB-4: unknown kind falls back to fastembed with a warning', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      const cfg = resolveEmbedderConfig({ MASTRA_EMBEDDER: 'cohere' });
      expect(cfg.kind).toBe('fastembed');
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('openai picks up base url + api key when provided', () => {
      const cfg = resolveEmbedderConfig({
        MASTRA_EMBEDDER: 'openai',
        MASTRA_EMBEDDER_BASE_URL: 'https://proxy.local/v1',
        MASTRA_EMBEDDER_API_KEY: 'sk-test',
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
      const a = collectionName('bge-small-en-v1.5', 384);
      const b = collectionName('text-embedding-3-small', 1536);
      expect(b).toBe('mastra_memory_text_embedding_3_small_1536');
      expect(a).not.toBe(b);
    });
  });

  // ── Recall tuning (AM-REC-5) ─────────────────────────────────────────────
  describe('resolveRecallTuning', () => {
    it('AM-REC-5: parses valid values', () => {
      expect(
        resolveRecallTuning({
          MASTRA_MEMORY_TOPK: '7',
          MASTRA_MEMORY_MIN_SCORE: '0.3',
        }),
      ).toEqual({ topK: 7, minScore: 0.3, scope: 'resource' });
    });

    it('AM-REC-5: garbage values fall back to defaults', () => {
      expect(
        resolveRecallTuning({
          MASTRA_MEMORY_TOPK: 'abc',
          MASTRA_MEMORY_MIN_SCORE: '9',
          MASTRA_MEMORY_SCOPE: 'banana',
        }),
      ).toEqual({ topK: 4, minScore: 0.5, scope: 'resource' });
    });

    it('honors thread scope', () => {
      expect(resolveRecallTuning({ MASTRA_MEMORY_SCOPE: 'thread' }).scope).toBe(
        'thread',
      );
    });
  });

  // ── Status (AM-SET-1/2) ──────────────────────────────────────────────────
  describe('computeAdvancedMemoryStatus', () => {
    it('AM-SET-1: disabled → all details null', () => {
      expect(computeAdvancedMemoryStatus({})).toEqual({
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
        computeAdvancedMemoryStatus({ MASTRA_MEMORY: 'enable' }, { reachable: true }),
      ).toMatchObject({
        enabled: true,
        embedder: 'fastembed',
        qdrantReachable: true,
        collection: 'mastra_memory_bge_small_en_v1_5_384',
      });
    });

    it('qdrantReachable is null until a health check runs', () => {
      const s = computeAdvancedMemoryStatus({ MASTRA_MEMORY: 'enable' });
      expect(s.enabled).toBe(true);
      expect(s.qdrantReachable).toBeNull();
    });
  });
});
