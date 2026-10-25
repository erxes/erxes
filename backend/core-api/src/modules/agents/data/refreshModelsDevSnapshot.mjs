// Regenerates modelsDevSnapshot.json from the public models.dev catalog.
//
//   node backend/core-api/src/modules/agents/data/refreshModelsDevSnapshot.mjs
//
// models.dev (https://models.dev, MIT, github.com/anomalyco/models.dev) is the
// catalog Mastra builds its registry from. Only display names and reasoning
// options of the four BYOK providers are kept; nothing calls models.dev at
// runtime. The run fails if a provider's endpoint no longer matches the one
// `providers.ts` calls, so a stale mapping is never written.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SOURCE = 'https://models.dev/api.json';
const TARGET = fileURLToPath(
  new URL('./modelsDevSnapshot.json', import.meta.url),
);

// Our provider → models.dev provider, with what identifies the endpoint
// `providers.ts` uses: OpenAI and xAI by their native AI SDK package, the
// OpenAI-compatible Moonshot and Kimi Code plans by their base URL.
const PROVIDERS = {
  openai: { modelsDev: 'openai', npm: '@ai-sdk/openai' },
  grok: { modelsDev: 'xai', npm: '@ai-sdk/xai' },
  kimi: { modelsDev: 'moonshotai', api: 'https://api.moonshot.ai/v1' },
  'kimi-code': {
    modelsDev: 'kimi-code-plan-cn',
    api: 'https://api.kimi.com/coding/v1',
  },
};

const pickModel = ({ id, name, reasoning, reasoning_options }) => ({
  id,
  ...(typeof name === 'string' ? { name } : {}),
  reasoning: reasoning === true,
  ...(Array.isArray(reasoning_options) && reasoning_options.length > 0
    ? { reasoning_options }
    : {}),
});

const response = await fetch(SOURCE, { signal: AbortSignal.timeout(30_000) });

if (!response.ok) {
  throw new Error(`models.dev responded ${response.status}`);
}

const catalog = await response.json();
const providers = {};

for (const [provider, expected] of Object.entries(PROVIDERS)) {
  const source = catalog[expected.modelsDev];

  if (!source) {
    throw new Error(`models.dev has no "${expected.modelsDev}" provider`);
  }

  if (expected.api && source.api !== expected.api) {
    throw new Error(
      `${expected.modelsDev} now points at ${source.api}, not ${expected.api}`,
    );
  }

  if (expected.npm && source.npm !== expected.npm) {
    throw new Error(
      `${expected.modelsDev} now uses ${source.npm}, not ${expected.npm}`,
    );
  }

  providers[provider] = {
    modelsDevProvider: expected.modelsDev,
    models: Object.fromEntries(
      Object.values(source.models)
        .map(pickModel)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((model) => [model.id, model]),
    ),
  };
}

const snapshot = {
  source: SOURCE,
  license: 'MIT, https://github.com/anomalyco/models.dev',
  snapshotDate: new Date().toISOString().slice(0, 10),
  fields: ['id', 'name', 'reasoning', 'reasoning_options'],
  providers,
};

await writeFile(TARGET, `${JSON.stringify(snapshot, null, 2)}\n`);

for (const [provider, { modelsDevProvider, models }] of Object.entries(
  providers,
)) {
  console.log(
    `${provider} → ${modelsDevProvider}: ${Object.keys(models).length} models`,
  );
}
