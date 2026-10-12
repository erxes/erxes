import type { PropsWithChildren } from 'react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { Provider } from 'jotai';
import { TELEGRAM_CHATS, type TelegramChat } from '../graphql';
import { useTelegramChats } from '../useTelegramChats';

jest.mock('ui-modules', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai');
  return { currentUserState: atom(null) };
});

const chat: TelegramChat = {
  conversationId: 'conversation',
  chatId: '-100123',
  chatType: 'supergroup',
  chatTitle: 'Test group',
  messageThreadId: 0,
  topicName: '',
};
type ChatsResponse = { telegramConversationChats: TelegramChat[] };
const request = (conversationIds: string[]) => ({
  query: TELEGRAM_CHATS,
  variables: { conversationIds },
});
const renderChats = (mocks: MockedResponse<ChatsResponse>[]) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider>
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    </Provider>
  );
  return renderHook(({ ids }) => useTelegramChats(ids), {
    initialProps: { ids: ['conversation'] },
    wrapper: Wrapper,
  });
};

test.each<{
  name: string;
  failure: Pick<MockedResponse<ChatsResponse>, 'error' | 'result'>;
}>([
  { name: 'network', failure: { error: new Error('Offline') } },
  {
    name: 'permission',
    failure: { result: { errors: [new GraphQLError('Permission denied')] } },
  },
])(
  'settles a $name failure and loads labels on a later request',
  async ({ failure }) => {
    const { result, rerender } = renderChats([
      { request: request(['conversation']), ...failure },
      {
        request: request(['conversation', 'another']),
        result: { data: { telegramConversationChats: [chat] } },
      },
    ]);

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.chats.size).toBe(0);

    rerender({ ids: ['conversation', 'another'] });
    await waitFor(() =>
      expect(result.current.chats.get('conversation')).toEqual(chat),
    );
    expect(result.current.loading).toBe(false);
  },
);

test('keeps previously loaded labels when a later metadata request fails', async () => {
  const { result, rerender } = renderChats([
    {
      request: request(['conversation']),
      result: { data: { telegramConversationChats: [chat] } },
    },
    {
      request: request(['conversation', 'another']),
      error: new Error('Offline'),
    },
  ]);

  await waitFor(() =>
    expect(result.current.chats.get('conversation')).toEqual(chat),
  );
  rerender({ ids: ['conversation', 'another'] });
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.chats.get('conversation')).toEqual(chat);
});
