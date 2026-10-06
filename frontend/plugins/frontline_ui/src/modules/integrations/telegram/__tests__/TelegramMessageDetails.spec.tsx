import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ButtonHTMLAttributes } from 'react';
import {
  TelegramMessageActions,
  TelegramMessageQuote,
  TelegramMessageStatus,
} from '../TelegramMessageDetails';
import { telegramReplyToState } from '../telegramReplyToState';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';

jest.mock('erxes-ui', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button aria-label={props['aria-label']} onClick={onClick}>
      {children}
    </button>
  ),
  cn: (value: string) => value,
}));
jest.mock('../translations', () => ({
  useTelegramTranslation: () => ({ t: (key: string) => key }),
}));

test('reply selection retains both chat and provider message identity and strips markup from its preview', () => {
  const store = createStore();
  render(
    <Provider store={store}>
      <TelegramMessageActions
        conversationId="chat-a"
        messageId="123"
        content="<p>Hello &amp; goodbye</p>"
      />
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'reply' }));
  expect(store.get(telegramReplyToState)).toEqual({
    conversationId: 'chat-a',
    messageId: '123',
    preview: 'Hello & goodbye',
  });
});

test('quoted provider content stays literal and unsupported reaction emoji stays readable', () => {
  const { container } = render(
    <>
      <TelegramMessageQuote
        data={{
          replyTo: {
            messageId: '7',
            chatId: '-1',
            senderName: 'Alice',
            content: '<img src=x onerror=alert(1)>',
          },
        }}
      />
      <TelegramMessageStatus
        data={{
          mediaGroupId: 'album',
          editedAt: '2026-10-06',
          reactions: [{ key: 'custom:1', label: 'Custom emoji', count: 2 }],
        }}
      />
    </>,
  );
  expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
  expect(container.querySelector('img')).toBeNull();
  expect(screen.getByText('albumPart')).toBeTruthy();
  expect(screen.getByText('edited')).toBeTruthy();
  expect(screen.getByText('Custom emoji 2')).toBeTruthy();
});

test('a multiple-choice Telegram poll counts people once rather than adding their choices', () => {
  const { container } = render(
    <MessagePoll
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
});
