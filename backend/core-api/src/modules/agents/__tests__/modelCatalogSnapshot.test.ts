/**
 * The bundled models.dev snapshot is the single source of model knowledge
 * for the catalog: Kimi Code's fixed plan catalog comes from it, and a model
 * it knows is judged by its data (tool calling, text in and text-only out).
 * Name patterns only decide for ids the snapshot does not know.
 */

import snapshot from '@/agents/data/modelsDevSnapshot.json';

interface IFixtureModel {
  id: string;
  name?: string;
  reasoning: boolean;
  tool_call: boolean;
  modalities: { input: string[]; output: string[] };
}

const chatModel = (id: string, toolCall = true): IFixtureModel => ({
  id,
  reasoning: false,
  tool_call: toolCall,
  modalities: { input: ['text'], output: ['text'] },
});

const fixture = (providers: Record<string, IFixtureModel[]>) => ({
  ...snapshot,
  providers: Object.fromEntries(
    Object.entries(providers).map(([provider, models]) => [
      provider,
      {
        modelsDevProvider: provider,
        models: Object.fromEntries(models.map((model) => [model.id, model])),
      },
    ]),
  ),
});

/** Loads the catalog module against one snapshot, isolated from the others. */
const catalogWith = (data: object) => {
  let loaded: typeof import('@/agents/modelCatalog') | undefined;

  jest.isolateModules(() => {
    jest.doMock('@/agents/data/modelsDevSnapshot.json', () => data);
    loaded = jest.requireActual<typeof import('@/agents/modelCatalog')>(
      '@/agents/modelCatalog',
    );
  });

  if (!loaded) throw new Error('modelCatalog did not load');

  return loaded;
};

const kimiCodeCatalog = (catalog: typeof import('@/agents/modelCatalog')) =>
  catalog
    .buildProviderModelCatalog({
      provider: 'kimi-code',
      entries: catalog.getDocumentedProviderModels('kimi-code'),
    })
    .map((model) => model.id)
    .sort();

describe('Kimi Code catalog from the snapshot', () => {
  it('is exactly the bundled snapshot’s Kimi Code models', () => {
    const catalog = catalogWith(snapshot);

    expect(kimiCodeCatalog(catalog)).toEqual(
      Object.keys(snapshot.providers['kimi-code'].models).sort(),
    );
  });

  it('follows the snapshot when a model is added or removed', () => {
    const withBoth = catalogWith(
      fixture({ 'kimi-code': [chatModel('k3'), chatModel('k9-preview')] }),
    );
    const withoutK3 = catalogWith(
      fixture({ 'kimi-code': [chatModel('k9-preview')] }),
    );

    expect(kimiCodeCatalog(withBoth)).toEqual(['k3', 'k9-preview']);
    expect(kimiCodeCatalog(withoutK3)).toEqual(['k9-preview']);
  });

  it('has no fixed catalog for providers whose models come from their own listing', () => {
    const catalog = catalogWith(fixture({ openai: [chatModel('gpt-6-luna')] }));

    expect(catalog.getDocumentedProviderModels('openai')).toEqual([]);
  });
});

describe('usability from snapshot data first', () => {
  const catalog = catalogWith(
    fixture({
      openai: [
        // Name patterns deny codex; the data says it is a tool-calling chat model.
        chatModel('gpt-9-codex'),
        // Name patterns allow it; the data says it cannot call tools.
        chatModel('gpt-9-no-tools', false),
        {
          ...chatModel('gpt-9-voice'),
          modalities: { input: ['text', 'audio'], output: ['text', 'audio'] },
        },
      ],
    }),
  );

  it('uses the snapshot’s tool-calling and modality data for models it knows', () => {
    expect(catalog.isUsableProviderModel('openai', 'gpt-9-codex')).toBe(true);
    expect(catalog.isUsableProviderModel('openai', 'gpt-9-no-tools')).toBe(
      false,
    );
    expect(catalog.isUsableProviderModel('openai', 'gpt-9-voice')).toBe(false);
  });

  it('falls back to name patterns only for ids the snapshot does not know', () => {
    expect(catalog.isUsableProviderModel('openai', 'gpt-9')).toBe(true);
    expect(
      catalog.isUsableProviderModel('openai', 'text-embedding-9-large'),
    ).toBe(false);
  });
});

describe('Kimi Code catalog ranking from the bundled snapshot', () => {
  const { buildProviderModelCatalog, getDocumentedProviderModels } =
    catalogWith(snapshot);

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
