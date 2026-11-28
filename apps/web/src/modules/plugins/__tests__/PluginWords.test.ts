// @vitest-environment happy-dom
import type { Activity } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type TRecordDraftProps, type TRecordSlotProps, useOpenRecord } from 'erxes-ui';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';

const Icon = () => null;

const Name = ({ contentId }: TRecordSlotProps) => createElement('span', null, `Deal ${contentId}`);

const Detail = ({ contentId }: TRecordSlotProps) => createElement('p', null, `About ${contentId}`);

const DealNew = ({ onCreated }: TRecordDraftProps) =>
  createElement('button', { type: 'button', onClick: () => onCreated('d9') }, 'Save deal');

// The sales plugin's `./config`: its words are its manifest's, not its UI's.
const CONFIGS: Record<string, unknown> = {
  'sales_ui/config': {
    name: 'sales',
    path: 'sales',
    recordTypes: [
      {
        contentType: 'sales:deal',
        title: 'Deal',
        icon: Icon,
        Title: Name,
        Detail,
        New: DealNew,
        detailPath: (id: string) => `/sales/deals/${id}`,
      },
      // An action recorded as a record: its draft is headed by what it does.
      {
        contentType: 'sales:handover',
        title: 'Handover',
        newTitle: 'Hand the deal over',
        icon: Icon,
        Title: Name,
        Detail,
        New: DealNew,
        detailPath: (id: string) => `/sales/handovers/${id}`,
      },
    ],
  },
};

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({ CONFIG: CONFIGS[id] }),
}));

/** What core answers: the sales plugin installed, with Mongolian in its manifest. */
const ANSWERS: Record<string, unknown> = {
  '/core/v1/plugins': {
    data: [
      {
        name: 'sales',
        manifest: {
          title: 'Sales',
          version: '1.0.0',
          translations: {
            mn: {
              Sales: 'Борлуулалт',
              Deal: 'Хэлцэл',
              'Deal created': 'Хэлцэл үүссэн',
              'Hand the deal over': 'Хэлцлийг шилжүүлэх',
            },
          },
        },
        installation: {
          status: 'active',
          statusReason: null,
          grantedScopes: [],
          installedAt: '2026-11-01T00:00:00.000Z',
        },
        requestedScopes: [],
        needsApproval: false,
      },
    ],
  },
  '/core/v1/activities/types': {
    types: [
      {
        type: 'sales.deal.created',
        label: 'Deal created',
        source: 'sales',
        icon: null,
        color: null,
      },
    ],
    timelines: [],
  },
};

const answer = async (input: RequestInfo | URL) => {
  const { pathname } = new URL(input instanceof Request ? input.url : String(input));

  return pathname in ANSWERS
    ? Response.json(ANSWERS[pathname])
    : Response.json({ code: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
};

let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv('PUBLIC_PLUGINS', 'sales_ui@http://plugins.test/sales_ui.js');
  vi.stubGlobal('fetch', answer);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);

  const { i18n, i18nReady } = await import('~/i18n');

  await i18nReady;
  await i18n.changeLanguage('mn');
});

afterAll(async () => {
  const { i18n } = await import('~/i18n');

  await i18n.changeLanguage('en');
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

/** A plugin's list, which opens a new deal, or a new record of `contentType`. */
const DealsList = ({ contentType = 'sales:deal' }: { contentType?: string }) => {
  const { openNew } = useOpenRecord();

  return createElement('button', { type: 'button', onClick: () => openNew(contentType) }, 'Add');
};

const render = async (url: string, children: ReactNode) => {
  const { usePluginTranslations } = await import('../pluginText');
  const { SidePanelLayout } = await import('~/modules/side-panel/SidePanelLayout');
  const { PanelRecordOpener } = await import('~/modules/side-panel/PanelRecordOpener');

  // What the main layout does once: the installed plugins' words into i18n.
  const Translations = () => {
    usePluginTranslations();

    return null;
  };

  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  window.history.replaceState(null, '', url);

  const app = createElement(
    BrowserRouter,
    null,
    createElement(
      NuqsAdapter,
      null,
      createElement(Translations),
      createElement(PanelRecordOpener, null, children),
      createElement(SidePanelLayout),
    ),
  );

  await act(async () => {
    root?.render(createElement(QueryClientProvider, { client: new QueryClient() }, app));
  });

  return container;
};

const panel = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-record-side-panel]');

describe('the side panel in Mongolian', () => {
  it('names its resize handle and tab list in the member’s language', async () => {
    const container = await render('/sales?panel=/detail/sales:deal/d1', null);

    await vi.waitFor(() => expect(panel(container)?.textContent).toContain('About d1'));
    expect(panel(container)?.querySelector('[role="separator"]')?.getAttribute('aria-label')).toBe(
      'Хажуу самбарын өргөнийг өөрчлөх',
    );
    expect(panel(container)?.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe(
      'Бичлэгийн навигаци',
    );
  });

  it('names the open record in a heading', async () => {
    const container = await render('/sales?panel=/detail/sales:deal/d1', null);

    await vi.waitFor(() =>
      expect(panel(container)?.querySelector('h2')?.textContent).toBe('Deal d1'),
    );
  });

  it('titles a new plugin record with the type’s name from the plugin’s manifest', async () => {
    const container = await render('/sales', createElement(DealsList));

    await act(async () => {
      container.querySelector('button')?.click();
    });

    await vi.waitFor(() =>
      expect(panel(container)?.querySelector('h2')?.textContent).toBe('Шинэ хэлцэл'),
    );
  });

  it('heads a draft with the type’s own new title, in the plugin’s words', async () => {
    const container = await render(
      '/sales',
      createElement(DealsList, { contentType: 'sales:handover' }),
    );

    await act(async () => {
      container.querySelector('button')?.click();
    });

    await vi.waitFor(() =>
      expect(panel(container)?.querySelector('h2')?.textContent).toBe('Хэлцлийг шилжүүлэх'),
    );
  });
});

describe('a customer a plugin added, in Mongolian', () => {
  it('names the plugin by its title in the manifest’s words', async () => {
    const { LeadPanelSection } = await import('~/modules/leads/LeadPanelSection');

    const container = await render(
      '/contacts/customers',
      createElement(LeadPanelSection, {
        recordType: 'customer',
        record: {
          id: 'c1',
          state: 'customer',
          ownerId: null,
          leadStageId: null,
          leadStageChangedAt: null,
          disqualifyReason: null,
          source: 'plugin',
          sourceDetails: { plugin: 'sales' },
          convertedAt: null,
        },
      }),
    );

    await vi.waitFor(() => expect(container.textContent).toContain('Борлуулалт'));
  });
});

describe('a plugin’s timeline entry in Mongolian', () => {
  const activity: Activity = {
    id: 'a1',
    targetType: 'sales.deal',
    targetId: 'd1',
    source: 'sales',
    type: 'sales.deal.created',
    summary: 'Ада хэлцэл нээв',
    data: {},
    link: null,
    entityType: null,
    entityId: null,
    actorType: 'plugin',
    actorId: 'sales',
    occurredAt: '2026-11-18T08:00:00.000Z',
    actorName: null,
    actorAvatarUrl: null,
    note: null,
    reactions: {},
  };

  it('reads the plugin’s title, the entry’s label and the record type in the manifest’s words', async () => {
    const { ActivityItem } = await import('~/modules/activity/ActivityItem');

    const container = await render(
      '/contacts/customers',
      createElement(
        'ul',
        null,
        createElement(ActivityItem, {
          activity,
          lookups: { members: new Map(), tags: new Map(), fields: new Map() },
          last: true,
          pageTarget: { type: 'customer', id: 'c1' },
        }),
      ),
    );

    await vi.waitFor(() => expect(container.textContent).toContain('Борлуулалт · Хэлцэл үүссэн'));
    // The deal it was on, by its type's name.
    expect(container.querySelector('li button')?.textContent).toBe('Хэлцэл');
  });
});
