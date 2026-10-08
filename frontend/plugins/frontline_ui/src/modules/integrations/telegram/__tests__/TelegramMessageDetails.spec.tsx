import { render, screen } from '@testing-library/react';
import { TelegramMessageStatus } from '../TelegramMessageDetails';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';
import { getMessageDisplay } from '@/inbox/conversation-messages/utils/messageDisplay';
import { IntegrationType } from '@/types/Integration';
import type { PropsWithChildren } from 'react';

jest.mock('erxes-ui', () => ({
  Badge: ({ children }: PropsWithChildren) => <span>{children}</span>,
  cn: (value: string) => value,
  stripHtml: (value?: string) =>
    new globalThis.DOMParser().parseFromString(value || '', 'text/html').body
      .textContent || '',
}));
jest.mock('../translations', () => ({
  useTelegramTranslation: () => ({ t: (key: string) => key }),
}));

test('quoted provider content stays literal and unsupported reaction emoji stays readable', () => {
  const { container } = render(
    <TelegramMessageStatus
      data={{
        mediaGroupId: 'album',
        editedAt: '2026-10-06',
        reactions: [{ key: 'custom:1', label: 'Custom emoji', count: 2 }],
      }}
    />,
  );
  const { effectiveReplyTo } = getMessageDisplay({
    integrationKind: IntegrationType.TELEGRAM_MESSENGER,
    isBotMessage: false,
    message: {
      _id: 'reply',
      content: 'Reply',
      createdAt: '',
      updatedAt: '',
      extraData: {
        telegram: {
          replyTo: {
            messageId: '7',
            chatId: '-1',
            senderName: 'Alice',
            content: '<img src=x onerror=alert(1)>',
          },
        },
      },
    },
  });
  expect(effectiveReplyTo).toEqual({
    messageId: '7',
    authorName: 'Alice',
    content: '<img src=x onerror=alert(1)>',
  });
  expect(container.querySelector('img')).toBeNull();
  expect(screen.getByText('albumPart')).toBeTruthy();
  expect(screen.getByText('edited')).toBeTruthy();
  expect(screen.getByText('Custom emoji 2')).toBeTruthy();
});

test('a multiple-choice Telegram poll counts people once rather than adding their choices', () => {
  const { container } = render(
    <MessagePoll
      provider="Telegram"
      poll={{
        question: 'Pick two',
        allowMultiselect: true,
        answers: [
          { id: 'a', text: 'A' },
          { id: 'b', text: 'B' },
        ],
        results: {
          isFinalized: false,
          totalVoters: 1,
          answerCounts: [
            { id: 'a', count: 1 },
            { id: 'b', count: 1 },
          ],
        },
      }}
    />,
  );
  expect(container.textContent).not.toContain('2 votes');
  expect(screen.getAllByText('1 vote')).toHaveLength(3);
  expect(screen.getByText(/Vote in Telegram/)).toBeTruthy();
});

test('existing Discord polls retain their label and sum answer counts by default', () => {
  render(
    <MessagePoll
      poll={{
        question: 'Pick one',
        answers: [
          { id: 'a', text: 'A' },
          { id: 'b', text: 'B' },
        ],
        results: {
          answerCounts: [
            { id: 'a', count: 1 },
            { id: 'b', count: 2 },
          ],
        },
      }}
    />,
  );
  expect(screen.getByText('3 votes')).toBeTruthy();
  expect(screen.getByText(/Vote in Discord/)).toBeTruthy();
});
