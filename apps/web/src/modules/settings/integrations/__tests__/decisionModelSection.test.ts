// @vitest-environment happy-dom
import type { Integration } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import { IntegrationsSettingsPage } from '../IntegrationsSettingsPage';

vi.mock('~/modules/auth/session', () => ({
  useCan: () => () => true,
  useSession: () => ({ organization: { country: 'US', currency: 'USD' } }),
}));

const state = { openaiConnected: false, typesafeConnected: false };

const integration = (
  key: string,
  name: string,
  category: Integration['category'],
  connected: boolean,
): Integration => ({
  key,
  plugin: null,
  connection: null,
  name,
  summary: `${name} summary`,
  category,
  countries: [],
  permission: 'assistant.manage',
  scopes: ['org', 'personal'],
  dashboard: null,
  keyed: true,
  fields: [{ key: 'apiKey', label: 'API key', type: 'secret', optional: false }],
  payments: null,
  sms: false,
  oauth: null,
  status: connected ? { state: 'connected', count: 1 } : { state: 'not-set-up', count: null },
  actions: [],
});

const handleFetch = async (request: Request) => {
  const { pathname } = new URL(request.url);

  if (pathname === '/core/v1/integrations') {
    return Response.json({
      data: [
        integration('openai', 'OpenAI', 'ai', state.openaiConnected),
        integration('anthropic', 'Anthropic', 'ai', false),
        integration('typesafe', 'TypeSafe', 'decision', state.typesafeConnected),
      ],
    });
  }

  return Response.json({ data: [] });
};

let root: Root | undefined;

const mount = async (url = '/settings/integrations?tab=browse') => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  window.history.replaceState(null, '', url);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
  });

  await act(async () => {
    root?.render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          I18nextProvider,
          { i18n },
          createElement(
            BrowserRouter,
            null,
            createElement(NuqsAdapter, null, createElement(IntegrationsSettingsPage)),
          ),
        ),
      ),
    );
  });

  return container;
};

const sectionByTitle = (container: Element, title: string) =>
  [...container.querySelectorAll('section')].find(
    (section) => section.querySelector('h2')?.textContent?.trim() === title,
  );

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal('fetch', handleFetch);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  await i18nReady;
  await i18n.loadNamespaces(['settings']);
});

beforeEach(() => {
  state.openaiConnected = false;
  state.typesafeConnected = false;
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

describe('Settings › Integrations › Decision model section', () => {
  it('shows TypeSafe and OpenAI in Decision model and marks OpenAI connected in both sections together', async () => {
    state.openaiConnected = true;

    const container = await mount();

    await vi.waitFor(() => {
      expect(sectionByTitle(container, 'AI Provider')).toBeDefined();
      expect(sectionByTitle(container, 'Decision model')).toBeDefined();
    });

    const aiSection = sectionByTitle(container, 'AI Provider');
    const decisionSection = sectionByTitle(container, 'Decision model');

    expect(aiSection?.textContent).toContain('OpenAI');
    expect(aiSection?.textContent).toContain('Anthropic');
    expect(aiSection?.textContent).not.toContain('TypeSafe');

    expect(decisionSection?.textContent).toContain('TypeSafe');
    expect(decisionSection?.textContent).toContain('OpenAI');
    expect(decisionSection?.textContent).not.toContain('Anthropic');

    const aiOpenAi = [...(aiSection?.querySelectorAll('a') ?? [])].find((link) =>
      link.textContent?.includes('OpenAI'),
    );

    const decisionOpenAi = [...(decisionSection?.querySelectorAll('a') ?? [])].find((link) =>
      link.textContent?.includes('OpenAI'),
    );

    expect(aiOpenAi?.textContent).toContain('Connected');
    expect(decisionOpenAi?.textContent).toContain('Connected');
    expect(aiOpenAi?.getAttribute('href')).toBe('/settings/integrations/openai');
    expect(decisionOpenAi?.getAttribute('href')).toBe('/settings/integrations/openai');
  });

  it('filters to only the Decision model section when the Decision model category is chosen', async () => {
    const container = await mount('/settings/integrations?tab=browse&category=decision');

    await vi.waitFor(() => {
      expect(sectionByTitle(container, 'Decision model')).toBeDefined();
    });

    expect(sectionByTitle(container, 'AI Provider')).toBeUndefined();
    expect(sectionByTitle(container, 'Decision model')?.textContent).toContain('TypeSafe');
    expect(sectionByTitle(container, 'Decision model')?.textContent).toContain('OpenAI');
  });
});
