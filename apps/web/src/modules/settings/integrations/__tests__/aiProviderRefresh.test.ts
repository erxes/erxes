// @vitest-environment happy-dom
import { type Integration, VaultConnection } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { i18n, i18nReady } from '~/i18n';
import { KeyNotice } from '~/modules/assistant/EmptyState';
import { ModelPicker } from '~/modules/assistant/ModelPicker';
import { useModelRun } from '~/modules/assistant/useModelRun';
import { PanelRecordOpener } from '~/modules/side-panel/PanelRecordOpener';
import { SidePanelLayout } from '~/modules/side-panel/SidePanelLayout';
import { IntegrationPage } from '../IntegrationPage';

vi.mock('~/modules/auth/session', () => ({
  useCan: () => () => true,
  useSession: () => ({ organization: { country: 'US', currency: 'USD' } }),
}));

const CONNECTION_ID = 'openaiConn0000001';

const UpdateBody = z.object({ status: VaultConnection.shape.status.optional() });

const state = { connected: false, status: 'active' as 'active' | 'disabled' };

const isActive = () => state.connected && state.status === 'active';

const currentConnection = (): VaultConnection => ({
  id: CONNECTION_ID,
  key: 'openai',
  name: 'OpenAI',
  status: state.status,
  createdAt: '2026-11-23T00:00:00.000Z',
  settings: {},
  usedBy: [],
});

const openAiIntegration = (): Integration => ({
  key: 'openai',
  plugin: null,
  connection: null,
  name: 'OpenAI',
  summary: 'GPT models for the assistant and agents.',
  category: 'ai',
  countries: [],
  permission: 'assistant.manage',
  dashboard: null,
  keyed: true,
  fields: [{ key: 'apiKey', label: 'API key', type: 'secret', optional: false }],
  payments: null,
  sms: false,
  oauth: null,
  status: !state.connected
    ? { state: 'not-set-up', count: null }
    : isActive()
      ? { state: 'connected', count: 1 }
      : { state: 'off', count: null },
  actions: [],
});

const modelsPayload = () =>
  isActive()
    ? [
        {
          provider: 'openai',
          error: null,
          models: [
            {
              id: 'gpt-5',
              family: 'gpt',
              recommended: true,
              name: 'GPT-5',
              thinking: null,
            },
          ],
        },
      ]
    : [];

const handleFetch = async (request: Request) => {
  const { pathname } = new URL(request.url);
  const method = request.method.toUpperCase();

  if (pathname === '/core/v1/integrations') {
    return Response.json({ data: [openAiIntegration()] });
  }

  if (pathname === '/core/v1/integrations/connections') {
    return Response.json({ data: state.connected ? [currentConnection()] : [] });
  }

  if (pathname === '/core/v1/integrations/openai/connections' && method === 'POST') {
    state.connected = true;
    state.status = 'active';

    return Response.json(currentConnection(), { status: 201 });
  }

  if (
    pathname === `/core/v1/integrations/openai/connections/${CONNECTION_ID}` &&
    method === 'PATCH'
  ) {
    const body = UpdateBody.parse(await request.json());

    if (body.status) state.status = body.status;

    return Response.json(currentConnection());
  }

  if (pathname === '/core/v1/assistant/providers') {
    return Response.json({ data: isActive() ? [{ provider: 'openai' }] : [] });
  }

  if (pathname === '/core/v1/assistant/settings') {
    return Response.json({ codeMode: false, defaultProvider: null, defaultModel: null });
  }

  if (pathname === '/core/v1/assistant/models') {
    return Response.json({ data: modelsPayload() });
  }

  if (pathname === '/core/v1/automations/catalog') {
    return Response.json({ triggers: [], actions: [], apps: [] });
  }

  return Response.json({ data: [] });
};

const clickButton = async (container: Element, label: string) => {
  const button = [...container.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );

  expect(button, `button "${label}"`).toBeDefined();
  await act(async () => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};

const fillInput = async (input: HTMLInputElement | null, value: string) => {
  expect(input).not.toBeNull();

  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
    input?.dispatchEvent(new Event('input', { bubbles: true }));
    input?.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const AssistantStatus = () => {
  const model = useModelRun();

  return createElement(
    'aside',
    { 'data-testid': 'assistant-status' },
    model.noKey ? createElement(KeyNotice) : null,
    createElement(ModelPicker, { state: model, disabled: model.noKey }),
  );
};

let root: Root | undefined;

const mountPage = async () => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  window.history.replaceState(null, '', '/settings/integrations/openai');

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
            createElement(
              NuqsAdapter,
              null,
              createElement(
                Routes,
                null,
                createElement(Route, {
                  path: '/settings/integrations/:key',
                  element: createElement(PanelRecordOpener, null, createElement(IntegrationPage)),
                }),
              ),
              createElement(SidePanelLayout),
              createElement(AssistantStatus),
            ),
          ),
        ),
      ),
    );
  });

  return container;
};

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal('fetch', handleFetch);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  await i18nReady;
  await i18n.loadNamespaces(['settings', 'assistant']);
});

beforeEach(() => {
  state.connected = false;
  state.status = 'active';
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

describe('AI provider connection changes', () => {
  it('updates the open assistant without a page refresh when connecting or turning off a provider', async () => {
    const container = await mountPage();
    const assistant = () => container.querySelector('[data-testid="assistant-status"]');

    await vi.waitFor(() => {
      expect(assistant()?.textContent).toContain(
        'Connect an AI provider in Integrations to start.',
      );
      expect(assistant()?.textContent).toContain('No provider');
      expect(container.textContent).toContain('Nothing connected yet.');
    });

    await clickButton(container, 'Connect');
    await vi.waitFor(() =>
      expect(container.querySelector('input[type="password"]')).not.toBeNull(),
    );

    await fillInput(container.querySelector('input[type="password"]'), 'sk-test-12345678');
    await clickButton(container, 'Connect OpenAI');

    await vi.waitFor(() => {
      expect(assistant()?.textContent).toContain('GPT-5');
      expect(assistant()?.textContent).not.toContain('No provider');
      expect(assistant()?.textContent).not.toContain(
        'Connect an AI provider in Integrations to start.',
      );
    });

    await vi.waitFor(() => expect(container.textContent).toContain('Turn off'));
    await clickButton(container, 'Turn off');

    await vi.waitFor(() => {
      expect(assistant()?.textContent).toContain('No provider');
      expect(assistant()?.textContent).toContain(
        'Connect an AI provider in Integrations to start.',
      );
    });
  });
});
