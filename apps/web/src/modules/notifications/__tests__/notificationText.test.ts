// @vitest-environment happy-dom
import type { Notification } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import { NotificationItem } from '../NotificationItem';

const confirmed: Notification = {
  id: 'n1',
  source: 'pms',
  kind: 'pms.reservation.confirmed',
  // What was sent beside the text: read only when there is no text to translate.
  title: 'As sent',
  body: 'As sent too',
  link: null,
  data: {
    text: {
      title: 'Reservation {{number}} confirmed',
      body: '{{nights}} nights from {{checkIn}}',
      values: { number: 'RS-000123', nights: 2, checkIn: '3 December' },
    },
  },
  priority: 'normal',
  entityType: null,
  entityId: null,
  actorType: 'plugin',
  actorId: 'pms',
  readAt: null,
  createdAt: '2026-11-20T08:00:00.000Z',
};

let root: Root | undefined;

/** The title and body a member reads on the notification's row in the inbox. */
const read = async (notification: Notification) => {
  const container = document.createElement('div');

  root = createRoot(container);

  await act(async () =>
    root?.render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(
          MemoryRouter,
          null,
          createElement(NotificationItem, { notification, sender: 'PMS' }),
        ),
      ),
    ),
  );

  const title = container.querySelector('li button')?.textContent ?? '';
  const body = container.querySelector('li p')?.textContent ?? '';

  return `${title} | ${body}`;
};

const inMongolian = async (run: () => Promise<void>) => {
  await act(async () => i18n.changeLanguage('mn'));

  try {
    await run();
  } finally {
    await act(async () => i18n.changeLanguage('en'));
  }
};

describe('a notification in the member’s language', () => {
  beforeAll(async () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    await i18nReady;
    // What a plugin's manifest `translations` add: its English text as the key.
    i18n.addResourceBundle('mn', 'pms', {
      'Reservation {{number}} confirmed': '{{number}} захиалга баталгаажлаа',
      '{{nights}} nights from {{checkIn}}': '{{checkIn}}-с {{nights}} шөнө',
    });
  });

  afterEach(() => {
    act(() => root?.unmount());
  });

  it('reads a plugin’s text in English with its values filled in', async () => {
    expect(await read(confirmed)).toBe(
      'Reservation RS-000123 confirmed | 2 nights from 3 December',
    );
  });

  it('fills in a value whose name is one of the translator’s own options', async () => {
    const named = {
      ...confirmed,
      data: { text: { title: 'From {{ns}} in {{lng}}', values: { ns: 'Front desk', lng: 'May' } } },
    };

    expect(await read(named)).toBe('From Front desk in May | As sent too');
  });

  it('reads the same notification in Mongolian once the member picks it', async () => {
    await inMongolian(async () => {
      expect(await read(confirmed)).toBe('RS-000123 захиалга баталгаажлаа | 3 December-с 2 шөнө');
    });
  });

  it('translates the title beside a body too long to have a translation', async () => {
    await inMongolian(async () => {
      const long = 'The boiler on floor {{floor}} is off. '.repeat(12).trim();

      const text = {
        title: 'Reservation {{number}} confirmed',
        body: long,
        values: { number: 'RS-1', floor: 3 },
      };

      expect(await read({ ...confirmed, data: { text } })).toBe(
        `RS-1 захиалга баталгаажлаа | ${long.replaceAll('{{floor}}', '3')}`,
      );
    });
  });

  it('keeps the English of a text the plugin has not translated', async () => {
    await inMongolian(async () => {
      const untranslated = {
        ...confirmed,
        data: { text: { title: 'Room {{room}} is out of order', values: { room: '204' } } },
      };

      expect(await read(untranslated)).toBe('Room 204 is out of order | As sent too');
    });
  });

  it('shows a plugin’s notification as sent when it carries no text to translate', async () => {
    await inMongolian(async () => {
      expect(await read({ ...confirmed, data: {} })).toBe('As sent | As sent too');
    });
  });

  it('still names core’s own kinds by kind', async () => {
    await inMongolian(async () => {
      const assigned: Notification = {
        ...confirmed,
        source: 'core',
        kind: 'core.customer.assigned',
        title: 'A customer was assigned to you',
        body: null,
        data: {},
      };

      expect(await read(assigned)).toBe('Танд харилцагч оноолоо | ');
    });
  });
});
