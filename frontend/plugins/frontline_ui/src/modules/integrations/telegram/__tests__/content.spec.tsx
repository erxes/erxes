import { fireEvent, render, screen } from '@testing-library/react';
import { linkifyTelegramContent } from '../TelegramMessageContent';
import {
  getTelegramStreamPlayer,
  TelegramMessageAttachments,
} from '../TelegramMessageAttachments';

jest.mock('erxes-ui', () => ({
  readImage: (url: string) => url,
  cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
  Skeleton: () => <div />,
}));
jest.mock('@/inbox/conversation-messages/components/MessageContent', () => ({
  MessageContent: () => null,
}));
jest.mock(
  '@/inbox/conversation-messages/components/messages/MessageStatus',
  () => ({
    UnsupportedMessage: ({ text }: { text: string }) => (
      <div role="alert">{text}</div>
    ),
  }),
);
jest.mock(
  '@/inbox/conversation-messages/components/MessageFileAttachment',
  () => ({
    MessageFileAttachment: () => null,
  }),
);
jest.mock('@/inbox/conversation-messages/components/InboxImage', () => ({
  InboxImage: () => null,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

test('historical plain URLs become links without interpreting literal HTML or double-linking editor content', () => {
  const result = linkifyTelegramContent(
    '&lt;b&gt;literal&lt;/b&gt; (https://jam.dev/c/test?a=1&amp;b=2). <a href="https://example.com">Existing</a><code>https://code.example</code>',
  );
  const doc = new DOMParser().parseFromString(result.html, 'text/html');
  expect(doc.querySelector('b')).toBeNull();
  expect(doc.body.textContent).toContain('<b>literal</b>');
  expect(doc.querySelectorAll('a')).toHaveLength(2);
  expect(doc.querySelector('a')?.href).toBe('https://jam.dev/c/test?a=1&b=2');
  expect(doc.querySelector('a')?.rel).toBe('noopener noreferrer');
  expect(doc.querySelector('code a')).toBeNull();
});

test('only the actual Cloudflare Stream origin can become an iframe', () => {
  expect(
    getTelegramStreamPlayer(
      'https://customer-example.cloudflarestream.com/video123/manifest/video.m3u8',
    ),
  ).toBe('https://customer-example.cloudflarestream.com/video123/iframe');
  expect(
    getTelegramStreamPlayer(
      'https://customer-example.cloudflarestream.com.evil.test/video123',
    ),
  ).toBeUndefined();
  expect(
    getTelegramStreamPlayer(
      'https://user:pass@customer-example.cloudflarestream.com/video123',
    ),
  ).toBeUndefined();
  expect(getTelegramStreamPlayer('file:///video.mp4')).toBeUndefined();
});

test('linkification preserves long valid URLs and trims unbalanced punctuation', () => {
  const url = `https://example.com/${'.'.repeat(100_000)}x_(balanced)`;
  const content = `${url}${')'.repeat(100_000)}.`;
  const { html } = linkifyTelegramContent(content);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  expect(doc.querySelector('a')?.getAttribute('href')).toBe(url);
  expect(doc.body.textContent).toBe(content);
});

test('audio has controls and a usable fallback when playback fails; history has no remove action', () => {
  const { container } = render(
    <TelegramMessageAttachments
      attachments={[
        {
          url: 'https://example.com/voice.ogg',
          name: 'voice.ogg',
          type: 'audio/ogg',
          size: 100,
        },
      ]}
    />,
  );
  const audio = container.querySelector('audio');
  expect(audio?.controls).toBe(true);
  if (!audio) throw new Error('Audio player missing');
  fireEvent.error(audio);
  expect(screen.getByRole('alert').textContent).toContain(
    'Attachment unavailable',
  );
  expect(
    screen.getByRole('link', { name: 'voice.ogg' }).getAttribute('href'),
  ).toBe('https://example.com/voice.ogg');
  expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
});

test('Stream video uses the hosted player and keeps an open link', () => {
  const { container } = render(
    <TelegramMessageAttachments
      attachments={[
        {
          url: 'https://customer-example.cloudflarestream.com/video123/manifest/video.m3u8',
          name: 'Recording',
          type: 'video/mp4',
          size: 100,
        },
      ]}
    />,
  );
  expect(container.querySelector('iframe')?.src).toBe(
    'https://customer-example.cloudflarestream.com/video123/iframe',
  );
  expect(container.querySelector('iframe')?.getAttribute('sandbox')).toBe(
    'allow-scripts allow-same-origin allow-presentation',
  );
  expect(container.querySelector('video')).toBeNull();
  expect(
    screen.getByRole('link', { name: 'Recording' }).getAttribute('href'),
  ).toBe('https://customer-example.cloudflarestream.com/video123/iframe');
});
