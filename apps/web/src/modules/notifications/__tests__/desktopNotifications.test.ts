// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { orpc } from '@erxes/core-contract/client';
import { i18n, i18nReady } from '~/i18n';
import { useDesktopNotifications } from '../useDesktopNotifications';

const popups: { title: string; body?: string }[] = [];

class FakePopup extends EventTarget {
  static permission = 'granted';

  constructor(title: string, options?: { body?: string }) {
    super();
    popups.push({ title, body: options?.body });
  }

  close() {
    return undefined;
  }
}

const confirmed = {
  id: 'n1',
  source: 'pms',
  kind: 'pms.reservation.confirmed',
  title: 'Reservation RS-000123 confirmed',
  body: null,
  link: null,
  data: {
    text: { title: 'Reservation {{number}} confirmed', values: { number: 'RS-000123' } },
  },
};

/** What core answers: the inbox, the settings, and the plugin registry when the test lets it. */
let inbox: unknown[] = [];
let inboxReads = 0;
let answerPlugins: () => void = () => undefined;

const pluginsAnswered = new Promise<void>((resolve) => {
  answerPlugins = resolve;
});

const core = async (input: RequestInfo | URL) => {
  const url = input instanceof Request ? input.url : String(input);

  if (url.includes('/notifications/settings')) {
    return Response.json({ groups: [], email: false, browser: true });
  }

  if (url.includes('/plugins')) {
    await pluginsAnswered;

    return Response.json({
      data: [
        {
          name: 'pms',
          manifest: {
            translations: {
              mn: { 'Reservation {{number}} confirmed': '{{number}} захиалга баталгаажлаа' },
            },
          },
        },
      ],
    });
  }

  inboxReads += 1;

  return Response.json({ data: inbox, totalCount: inbox.length, pageInfo: {} });
};

const Popups = () => {
  useDesktopNotifications();

  return null;
};

let root: Root | undefined;

describe('desktop notifications', () => {
  beforeAll(async () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    vi.stubGlobal('Notification', FakePopup);
    vi.stubGlobal('fetch', core);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    await i18nReady;
    await i18n.changeLanguage('mn');
  });

  afterEach(async () => {
    act(() => root?.unmount());
    await i18n.changeLanguage('en');
  });

  it('pops a plugin’s notification up in the member’s language, once its words are there', async () => {
    const client = new QueryClient();

    root = createRoot(document.createElement('div'));

    await act(async () =>
      root?.render(
        createElement(
          QueryClientProvider,
          { client },
          createElement(MemoryRouter, null, createElement(Popups)),
        ),
      ),
    );

    // The inbox as it was when the popups were turned on, then one new notification.
    await vi.waitFor(() => expect(inboxReads).toBeGreaterThan(0));

    inbox = [confirmed];
    await act(async () => client.refetchQueries({ queryKey: orpc.notifications.key() }));

    // The plugin's translations have not arrived: nothing is shown in English meanwhile.
    expect(popups).toEqual([]);

    answerPlugins();

    await vi.waitFor(() =>
      expect(popups).toEqual([{ title: 'RS-000123 захиалга баталгаажлаа', body: undefined }]),
    );
  });
});
