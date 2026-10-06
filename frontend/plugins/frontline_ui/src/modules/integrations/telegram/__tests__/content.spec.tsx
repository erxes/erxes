import { fireEvent, render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { linkifyTelegramContent } from '../TelegramMessageContent';
import {
  getMessageStreamPlayer,
  MessageMedia,
} from '@/inbox/conversation-messages/components/MessageMedia';
import type { HTMLAttributes } from 'react';

jest.mock('erxes-ui', () => ({
  readImage: (url: string) => url,
  Alert: Object.assign(
    ({ children }: HTMLAttributes<HTMLDivElement>) => (
      <div role="alert">{children}</div>
    ),
    {
      Description: ({ children }: HTMLAttributes<HTMLDivElement>) => (
        <div>{children}</div>
      ),
    },
  ),
  Skeleton: () => <div />,
}));
jest.mock('@/inbox/conversation-messages/components/MessageContent', () => ({
  MessageContent: () => null,
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
    getMessageStreamPlayer(
      'https://customer-example.cloudflarestream.com/video123/manifest/video.m3u8',
    ),
  ).toBe('https://customer-example.cloudflarestream.com/video123/iframe');
  expect(
    getMessageStreamPlayer(
      'https://customer-example.cloudflarestream.com.evil.test/video123',
    ),
  ).toBeUndefined();
  expect(
    getMessageStreamPlayer(
      'https://user:pass@customer-example.cloudflarestream.com/video123',
    ),
  ).toBeUndefined();
  expect(getMessageStreamPlayer('file:///video.mp4')).toBeUndefined();
});

test('audio has controls and a usable fallback when playback fails; history has no remove action', () => {
  const { container } = render(
    <MockedProvider>
      <MessageMedia
        attachment={{
          url: 'https://example.com/voice.ogg',
          name: 'voice.ogg',
          type: 'audio/ogg',
          size: 100,
        }}
      />
    </MockedProvider>,
  );
  const audio = container.querySelector('audio');
  expect(audio?.controls).toBe(true);
  if (!audio) throw new Error('Audio player missing');
  fireEvent.error(audio);
  expect(screen.getByRole('alert').textContent).toContain('could not play');
  expect(
    screen.getByRole('link', { name: 'voice.ogg' }).getAttribute('href'),
  ).toBe('https://example.com/voice.ogg');
  expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
});
