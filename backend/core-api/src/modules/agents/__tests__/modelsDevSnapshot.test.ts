/**
 * The bundled models.dev snapshot: provenance is recorded, only the four BYOK
 * providers and the four allowed fields are kept, each provider maps to the
 * models.dev provider whose endpoint `providers.ts` calls, and the models the
 * picker depends on are present.
 */

import snapshot from '@/agents/data/modelsDevSnapshot.json';
import { BYOK_PROVIDERS } from '@/agents/providerModels';
import { getModelDisplayName, getModelThinking } from '@/agents/modelThinking';

const ALLOWED_FIELDS = ['id', 'name', 'reasoning', 'reasoning_options'];

it('records source, licence and date', () => {
  expect(snapshot.source).toBe('https://models.dev/api.json');
  expect(snapshot.license).toContain('MIT');
  expect(snapshot.snapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

it('holds exactly the BYOK providers, each mapped to its endpoint’s models.dev provider', () => {
  expect(Object.keys(snapshot.providers).sort()).toEqual(
    [...BYOK_PROVIDERS].sort(),
  );
  expect(
    Object.fromEntries(
      Object.entries(snapshot.providers).map(([provider, value]) => [
        provider,
        value.modelsDevProvider,
      ]),
    ),
  ).toEqual({
    openai: 'openai',
    grok: 'xai',
    kimi: 'moonshotai',
    'kimi-code': 'kimi-code-plan-cn',
  });
});

it('keeps only the allowed fields, keyed by model id', () => {
  for (const { models } of Object.values(snapshot.providers)) {
    for (const [id, model] of Object.entries(models)) {
      expect(model.id).toBe(id);
      expect(
        Object.keys(model).filter((key) => !ALLOWED_FIELDS.includes(key)),
      ).toEqual([]);
    }
  }
});

it('knows the models the picker relies on', () => {
  expect(getModelDisplayName('openai', 'gpt-6-luna')).toBe('GPT-6 Luna');
  expect(getModelThinking('kimi-code', 'k3.1-pro')?.levels).toEqual([
    'low',
    'high',
    'max',
  ]);
  expect(getModelThinking('kimi-code', 'k3')?.levels).toContain('off');
});
