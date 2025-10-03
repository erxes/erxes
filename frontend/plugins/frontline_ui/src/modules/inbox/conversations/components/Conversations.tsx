import { useInView } from 'react-intersection-observer';
import { IconLoader } from '@tabler/icons-react';

import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';
import { ConversationListContext } from '@/inbox/conversations/context/ConversationListContext';
import { IConversation } from '@/inbox/types/Conversation';
import { useConversations } from '@/inbox/conversations/hooks/useConversations';

import {
  Button,
  EnumCursorDirection,
  EnumCursorMode,
  Filter,
  isUndefinedOrNull,
  parseDateRangeFromString,
  Separator,
  useNonNullMultiQueryState,
} from 'erxes-ui';

import { ConversationsHeader } from '@/inbox/conversations/components/ConversationsHeader';
import { CONVERSATIONS_LIMIT } from '@/inbox/constants/conversationsConstants';
import { ConversationItem } from './ConversationItem';
import { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { refetchNewMessagesState } from '@/inbox/conversations/states/newMessagesCountState';
import { conversationsContainerScrollState } from '@/inbox/conversations/states/conversationsContainerScrollState';
import { ConversationActions } from './ConversationActions';

export const Conversations = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const refetchNewMessages = useAtomValue(refetchNewMessagesState);
  const [conversationsContainerScroll, setConversationsContainerScroll] =
    useAtom(conversationsContainerScrollState);
  const [rerendered, setRerendered] = useState(false);

  const [ref] = useInView({
    onChange(inView) {
      if (inView) {
        handleFetchMore({
          direction: EnumCursorDirection.FORWARD,
        });
      }
    },
  });

  useEffect(() => {
    if (
      containerRef.current &&
      !isUndefinedOrNull(conversationsContainerScroll) &&
      !rerendered
    ) {
      containerRef.current.scrollTo({
        top: conversationsContainerScroll,
      });
      setConversationsContainerScroll(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationsContainerScroll]);

  useEffect(() => {
    if (refetchNewMessages) {
      containerRef.current?.scrollTo({
        top: 0,
      });
    }
  }, [refetchNewMessages]);

  const { channelId, integrationType, unassigned, status, created } =
    useNonNullMultiQueryState<{
      channelId: string;
      integrationType: string;
      unassigned: string;
      status: string;
      conversationId: string;
      created: string;
    }>([
      'channelId',
      'integrationType',
      'unassigned',
      'status',
      'conversationId',
      'created',
    ]);

  const parsedDate = parseDateRangeFromString(created || '');

  const { totalCount, conversations, handleFetchMore, loading, pageInfo } =
    useConversations({
      variables: {
        limit: CONVERSATIONS_LIMIT,
        channelId,
        integrationType: integrationType,
        unassigned,
        status: status || '',
        startDate: parsedDate?.from,
        endDate: parsedDate?.to,
        cursorMode: EnumCursorMode.INCLUSIVE,
      },
    });

  return (
    <ConversationListContext.Provider
      value={{
        conversations,
        loading,
        totalCount,
      }}
    >
      <div className="flex flex-col h-full overflow-hidden w-full">
        <Filter id="conversations">
          <ConversationsHeader>
            <ConversationActions />
          </ConversationsHeader>
        </Filter>
        <Separator />
        <div className="h-full w-full overflow-y-auto" ref={containerRef}>
          {conversations?.map((conversation: IConversation) => (
            <ConversationContext.Provider
              key={conversation._id}
              value={conversation}
            >
              <ConversationItem
                onConversationSelect={() => {
                  setConversationsContainerScroll(
                    containerRef.current?.scrollTop || 0,
                  );
                  setRerendered(true);
                }}
              />
            </ConversationContext.Provider>
          ))}
          {!loading && conversations?.length > 0 && pageInfo?.hasNextPage && (
            <Button
              variant="ghost"
              ref={ref}
              className="pl-6 h-8 w-full text-muted-foreground"
              asChild
            >
              <div>
                <IconLoader className="size-4 animate-spin" />
                loading more...
              </div>
            </Button>
          )}
        </div>
      </div>
    </ConversationListContext.Provider>
  );
};
