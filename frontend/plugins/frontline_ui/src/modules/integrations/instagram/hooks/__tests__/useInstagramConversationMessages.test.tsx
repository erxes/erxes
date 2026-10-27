import { act, renderHook, waitFor } from '@testing-library/react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import type { PropsWithChildren } from 'react';
import { useInstagramConversationMessages } from '../useInstagramConversationMessages';

jest.mock('erxes-ui', () => ({ useQueryState: () => ['conversation'] }));

const message = (_id: string, mid: string | null = 'provider-mid') => ({
  __typename: 'InstagramConversationMessage',
  _id,
  mid,
  conversationId: 'conversation',
  content: 'Original',
  createdAt: '2026-10-27T00:00:01.000Z',
  userId: null,
  customerId: 'customer',
  internal: false,
  isCustomerRead: false,
  messageKind: 'text',
  deliveryStatus: 'sent',
  expiresAt: null,
  extraData: null,
  replyTo: null,
  reactions: null,
  attachments: [],
  providerData: mid
    ? {
        __typename: 'MessageProviderData',
        messageId: mid,
        attachmentType: null,
        fallbackReason: null,
        previewText: null,
        previewUrl: null,
        shareType: null,
        storyUrl: null,
      }
    : null,
  contentType: null,
  formWidgetData: null,
  fromBot: false,
  botData: null,
  source: null,
  relatedMessage: null,
});
type TestMessage = ReturnType<typeof message>;

const setup = (
  initial = [message('provider-row')],
  count = initial.length,
  older = initial,
) => {
  let sendEvent: ((event: Partial<TestMessage>) => void) | undefined;
  let subscriptions = 0;
  const requestedSkips: number[] = [];
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        if (
          operation.operationName === 'FrontlineConversationMessageInserted'
        ) {
          subscriptions++;
          sendEvent = (event) =>
            observer.next({
              data: {
                conversationMessageInserted: {
                  ...message('canonical-row'),
                  ...event,
                  __typename: 'ConversationMessage',
                },
              },
            });
          return () => {
            sendEvent = undefined;
          };
        }
        requestedSkips.push(operation.variables.skip || 0);
        observer.next({
          data: {
            instagramConversationMessages: operation.variables.skip
              ? older
              : initial,
            instagramConversationMessagesCount: count,
          },
        });
        observer.complete();
        return undefined;
      }),
  );
  const client = new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: { InstagramConversationMessage: { keyFields: ['_id'] } },
    }),
  });
  const hook = renderHook(() => useInstagramConversationMessages(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    ),
  });
  return {
    ...hook,
    client,
    requestedSkips,
    subscriptions: () => subscriptions,
    emit: (event: Partial<TestMessage>) => {
      if (!sendEvent) throw new Error('Subscription not ready');
      sendEvent(event);
    },
  };
};

test('merges read and unsend events into the existing provider row without duplicates', async () => {
  const hook = setup();
  await waitFor(() =>
    expect(hook.result.current.instagramConversationMessages).toHaveLength(1),
  );
  act(() => hook.emit({ deliveryStatus: 'read', isCustomerRead: true }));
  await waitFor(() =>
    expect(
      hook.result.current.instagramConversationMessages?.[0].deliveryStatus,
    ).toBe('read'),
  );
  expect(hook.result.current.totalCount).toBe(1);
  act(() =>
    hook.emit({
      content: '',
      messageKind: 'deleted',
      deliveryStatus: 'deleted',
    }),
  );
  await waitFor(() =>
    expect(
      hook.result.current.instagramConversationMessages?.[0],
    ).toMatchObject({
      _id: 'provider-row',
      content: '',
      messageKind: 'deleted',
    }),
  );
  expect(hook.result.current.instagramConversationMessages).toHaveLength(1);
  hook.rerender();
  expect(hook.subscriptions()).toBe(1);
  hook.unmount();
  hook.client.stop();
});

test('new internal notes appear once and match their persisted canonical IDs', async () => {
  const hook = setup();
  await waitFor(() =>
    expect(hook.result.current.instagramConversationMessages).toHaveLength(1),
  );
  const note = {
    _id: 'note',
    mid: null,
    providerData: null,
    internal: true,
    content: 'Internal note',
    createdAt: '2026-10-27T00:00:02.000Z',
  };
  act(() => hook.emit(note));
  await waitFor(() => expect(hook.result.current.totalCount).toBe(2));
  act(() => hook.emit({ ...note, content: 'Updated note' }));
  await waitFor(() =>
    expect(hook.result.current.instagramConversationMessages?.[1].content).toBe(
      'Updated note',
    ),
  );
  expect(hook.result.current.instagramConversationMessages).toHaveLength(2);
  hook.unmount();
  hook.client.stop();
});

test('pagination does not duplicate an event already loaded under its canonical ID', async () => {
  const canonical = message('canonical-row');
  const old = {
    ...message('older', 'older-mid'),
    createdAt: '2026-10-27T00:00:00.000Z',
  };
  const hook = setup([canonical], 2, [old, message('provider-row')]);
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  await act(async () => {
    await Promise.all([
      hook.result.current.handleFetchMore(),
      hook.result.current.handleFetchMore(),
    ]);
  });
  expect(hook.requestedSkips).toEqual([0, 1]);
  await waitFor(() =>
    expect(
      hook.result.current.instagramConversationMessages?.map(
        (item) => item._id,
      ),
    ).toEqual(['older', 'canonical-row']),
  );
  hook.unmount();
  hook.client.stop();
});

test('providerData alone matches a comment reply and does not increase its count', async () => {
  const hook = setup([message('reply-row', 'comment-id')]);
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  act(() =>
    hook.emit({
      ...message('reply-canonical', 'comment-id'),
      mid: null,
      content: 'Reply text',
    }),
  );
  await waitFor(() =>
    expect(hook.result.current.instagramConversationMessages?.[0].content).toBe(
      'Reply text',
    ),
  );
  expect(hook.result.current.totalCount).toBe(1);
  hook.unmount();
  hook.client.stop();
});
