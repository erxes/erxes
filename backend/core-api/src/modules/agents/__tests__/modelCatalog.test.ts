/**
 * Model catalog classification: each provider's raw /models listing is
 * reduced to tool-calling chat models, dated snapshots collapse behind their
 * alias, and a short recommended list leads with the saved/default model.
 */

import {
  buildProviderModelCatalog,
  getDocumentedProviderModels,
  isUsableProviderModel,
  RECOMMENDED_MODEL_LIMIT,
} from '@/agents/modelCatalog';

const ids = (list: string[]) => list.map((id) => ({ id }));

describe('buildProviderModelCatalog', () => {
  it('keeps only chat models OpenAI can run through the Responses client', () => {
    const catalog = buildProviderModelCatalog({
      provider: 'openai',
      entries: ids([
        'gpt-5.6-luna',
        'gpt-5.6',
        'gpt-5.6-mini',
        'gpt-5.6-pro',
        'gpt-5.6-2026-08-01',
        'gpt-5.5',
        'gpt-5.5-2026-03-04',
        'gpt-5-chat-latest',
        'gpt-5-codex',
        'gpt-4.1',
        'gpt-4.1-mini-2025-04-14',
        'gpt-4o',
        'gpt-4o-2024-08-06',
        'gpt-4o-search-preview',
        'gpt-4o-mini-tts',
        'gpt-4o-transcribe',
        'gpt-4o-audio-preview',
        'gpt-4o-realtime-preview',
        'gpt-audio',
        'gpt-realtime',
        'gpt-image-1',
        'chatgpt-4o-latest',
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4-0613',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-instruct',
        'babbage-002',
        'davinci-002',
        'o3',
        'o3-2025-04-16',
        'o4-mini',
        'o1-mini',
        'o3-deep-research',
        'codex-mini-latest',
        'computer-use-preview',
        'omni-moderation-latest',
        'text-embedding-3-small',
        'tts-1-hd',
        'whisper-1',
        'dall-e-3',
        'sora-2',
      ]),
      preferred: ['gpt-5.6-luna'],
    });

    expect(catalog.map((model) => model.id)).toEqual([
      'gpt-5.6',
      'gpt-5.6-pro',
      'gpt-5.6-luna',
      'gpt-5.6-mini',
      'gpt-5.5',
      'gpt-4.1',
      'gpt-4.1-mini-2025-04-14',
      'gpt-4o',
      'o4-mini',
      'o3',
    ]);
    expect(
      catalog.filter((model) => model.recommended).map((model) => model.id),
    ).toEqual(['gpt-5.6', 'gpt-5.6-luna', 'gpt-5.6-mini', 'gpt-5.5']);
    expect(catalog.find((model) => model.id === 'o4-mini')?.family).toBe('o4');
  });

  it('collapses unaliased snapshots to the newest one and recommends the leading line', () => {
    const catalog = buildProviderModelCatalog({
      provider: 'kimi',
      entries: ids([
        'kimi-k2-0711-preview',
        'kimi-k2-0905-preview',
        'kimi-k3',
        'kimi-thinking-preview',
        'moonshot-v1-8k',
        'moonshot-v1-8k-vision-preview',
      ]),
      preferred: ['kimi-k3'],
    });

    expect(catalog).toEqual([
      { id: 'kimi-k3', family: 'kimi-k3', recommended: true },
      { id: 'kimi-k2-0905-preview', family: 'kimi-k2', recommended: true },
      { id: 'moonshot-v1-8k', family: 'moonshot-v1', recommended: false },
      {
        id: 'moonshot-v1-8k-vision-preview',
        family: 'moonshot-v1',
        recommended: false,
      },
    ]);
  });

  it('keeps a preferred snapshot even when its alias is listed', () => {
    const catalog = buildProviderModelCatalog({
      provider: 'openai',
      entries: ids(['gpt-4o', 'gpt-4o-2024-08-06']),
      preferred: ['gpt-4o-2024-08-06'],
    });

    expect(catalog.map((model) => model.id)).toEqual([
      'gpt-4o',
      'gpt-4o-2024-08-06',
    ]);
    expect(catalog.every((model) => model.recommended)).toBe(true);
  });

  it('ranks grok versions written with dots or dashes and drops media models', () => {
    const catalog = buildProviderModelCatalog({
      provider: 'grok',
      entries: [
        { id: 'grok-4-1-fast-reasoning', created: 3 },
        { id: 'grok-4-1-fast-non-reasoning', created: 3 },
        { id: 'grok-4.5', created: 4 },
        { id: 'grok-4', created: 2 },
        { id: 'grok-4-0709', created: 1 },
        { id: 'grok-code-fast-1', created: 5 },
        { id: 'grok-2-image-1212' },
        { id: 'grok-imagine-video' },
      ],
    });

    expect(catalog.map((model) => [model.id, model.family])).toEqual([
      ['grok-4.5', 'grok-4.5'],
      ['grok-4-1-fast-reasoning', 'grok-4-1'],
      ['grok-4-1-fast-non-reasoning', 'grok-4-1'],
      ['grok-4', 'grok-4'],
      ['grok-code-fast-1', ''],
    ]);
    expect(
      catalog.filter((model) => model.recommended).map((model) => model.id),
    ).toEqual(['grok-4.5', 'grok-4-1-fast-reasoning', 'grok-4']);
  });

  it('leads the recommended list with listed preferred models only', () => {
    const catalog = buildProviderModelCatalog({
      provider: 'kimi-code',
      entries: ids(['kimi-for-coding', 'kimi-k3', 'kimi-k2']),
      preferred: ['missing-model', 'kimi-for-coding'],
    });

    expect(catalog.map((model) => model.id)).toEqual([
      'kimi-k3',
      'kimi-k2',
      'kimi-for-coding',
    ]);
    expect(catalog.every((model) => model.recommended)).toBe(true);
    expect(catalog.some((model) => model.id === 'missing-model')).toBe(false);
  });

  it('caps the recommended list and de-duplicates ids', () => {
    const catalog = buildProviderModelCatalog({
      provider: 'openai',
      entries: ids([
        ' gpt-5.6 ',
        'gpt-5.6',
        'gpt-5.6-mini',
        'gpt-5.6-nano',
        'gpt-5.5',
        'gpt-5.5-mini',
        '',
      ]),
    });

    expect(catalog).toHaveLength(5);
    expect(catalog.filter((model) => model.recommended)).toHaveLength(
      RECOMMENDED_MODEL_LIMIT,
    );
  });

  it('applies the shared non-chat rules to unknown providers', () => {
    expect(isUsableProviderModel('other', 'some-chat-model')).toBe(true);
    expect(isUsableProviderModel('other', 'Some-Embedding-Model')).toBe(false);
    expect(isUsableProviderModel('kimi', 'kimi-thinking-preview')).toBe(false);
    expect(isUsableProviderModel('openai', 'gpt-4.5-preview')).toBe(true);
  });
});

describe('allowed-model style ids', () => {
  it('keeps gpt-6-* and *-luna ids and ranks the newest generation first', () => {
    const catalog = buildProviderModelCatalog({
      provider: 'openai',
      entries: ids(['gpt-5.6-luna', 'gpt-6-luna', 'gpt-6', 'gpt-6-luna-mini']),
      preferred: ['gpt-5.6-luna'],
    });

    expect(catalog.map((model) => [model.id, model.family])).toEqual([
      ['gpt-6', 'gpt-6'],
      ['gpt-6-luna', 'gpt-6'],
      ['gpt-6-luna-mini', 'gpt-6'],
      ['gpt-5.6-luna', 'gpt-5.6'],
    ]);
    expect(catalog.every((model) => model.recommended)).toBe(true);
    expect(isUsableProviderModel('openai', 'gpt-6-luna')).toBe(true);
    expect(isUsableProviderModel('openai', 'gpt-5.6-luna')).toBe(true);
  });

  it('keeps a project restricted to exactly two luna models intact', () => {
    const catalog = buildProviderModelCatalog({
      provider: 'openai',
      entries: ids(['gpt-6-luna', 'gpt-5.6-luna']),
      preferred: ['gpt-5.6-luna'],
    });

    expect(catalog).toEqual([
      { id: 'gpt-6-luna', family: 'gpt-6', recommended: true },
      { id: 'gpt-5.6-luna', family: 'gpt-5.6', recommended: true },
    ]);
  });
});

describe('documented provider models', () => {
  it('lists Kimi Code’s documented ids as usable, recommending standard tiers', () => {
    const catalog = buildProviderModelCatalog({
      provider: 'kimi-code',
      entries: getDocumentedProviderModels('kimi-code'),
      preferred: ['kimi-for-coding'],
    });

    expect(catalog.map((model) => [model.id, model.family])).toEqual([
      ['k3.1-pro', 'k3.1'],
      ['k3.1-pro-highspeed', 'k3.1'],
      ['k3', 'k3'],
      ['k3-256k', 'k3'],
      ['kimi-for-coding', ''],
      ['kimi-for-coding-highspeed', ''],
    ]);
    expect(
      catalog.filter((model) => !model.recommended).map((model) => model.id),
    ).toEqual(['k3.1-pro-highspeed', 'kimi-for-coding-highspeed']);
  });

  it('has no documented set for providers that publish a listing', () => {
    expect(getDocumentedProviderModels('openai')).toEqual([]);
  });
});
