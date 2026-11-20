// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import { useNotificationText } from '../notificationText';

type Shown = Parameters<ReturnType<typeof useNotificationText>>[0];

const Line = ({ notification }: { notification: Shown }) => {
  const { title, body } = useNotificationText()(notification);

  return createElement('p', null, `${title} | ${body ?? ''}`);
};

const confirmed: Shown = {
  source: 'pms',
  kind: 'pms.reservation.confirmed',
  title: 'Reservation RS-000123 confirmed',
  body: '2 nights from 3 December',
  data: {
    text: {
      title: 'Reservation {{number}} confirmed',
      body: '{{nights}} nights from {{checkIn}}',
      values: { number: 'RS-000123', nights: 2, checkIn: '3 December' },
    },
  },
};

let root: Root | undefined;

const read = async (notification: Shown) => {
  const container = document.createElement('div');

  root = createRoot(container);
  await act(async () => root?.render(createElement(Line, { notification })));

  return container.textContent;
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
    // The text and its values are what is read, not the title and body sent beside them.
    const sent = { ...confirmed, title: 'As sent', body: 'As sent' };

    expect(await read(sent)).toBe('Reservation RS-000123 confirmed | 2 nights from 3 December');
  });

  it('fills in a value whose name is one of the translator’s own options', async () => {
    const named = {
      ...confirmed,
      data: { text: { title: 'From {{ns}} in {{lng}}', values: { ns: 'Front desk', lng: 'May' } } },
    };

    expect(await read(named)).toBe('From Front desk in May | 2 nights from 3 December');
  });

  it('reads the same notification in Mongolian once the member picks it', async () => {
    await inMongolian(async () => {
      expect(await read(confirmed)).toBe('RS-000123 захиалга баталгаажлаа | 3 December-с 2 шөнө');
    });
  });

  it('keeps the English of a text the plugin has not translated', async () => {
    await inMongolian(async () => {
      const untranslated = {
        ...confirmed,
        data: { text: { title: 'Room {{room}} is out of order', values: { room: '204' } } },
      };

      expect(await read(untranslated)).toBe('Room 204 is out of order | 2 nights from 3 December');
    });
  });

  it('shows a plugin’s notification as sent when it carries no text to translate', async () => {
    await inMongolian(async () => {
      expect(await read({ ...confirmed, data: {} })).toBe(
        'Reservation RS-000123 confirmed | 2 nights from 3 December',
      );
    });
  });

  it('still names core’s own kinds by kind', async () => {
    await inMongolian(async () => {
      const assigned = {
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
