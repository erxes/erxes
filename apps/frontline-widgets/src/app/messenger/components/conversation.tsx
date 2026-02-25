import { IconFile } from '@tabler/icons-react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import { Avatar, Button, cn, formatDateISOStringToRelativeDate, readImage, Tooltip } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useGetMessengerSupporters } from '../hooks/useGetMessengerSupporters';
import {
  ReadConversationResult,
  useReadConversation,
} from '../hooks/useReadConversation';
import {
  connectionAtom,
  conversationIdAtom,
  setActiveTabAtom,
} from '../states';
import {
  IAttachment,
  IConversationMessage,
  ISupporter,
} from '../types';
import { AvatarGroup } from './avatar-group';

export function EmptyChat() {
  const connection = useAtomValue(connectionAtom);
  const { messengerData } = connection?.widgetsMessengerConnect || {};
  const { responseRate } = messengerData || {};
  const { list } = useGetMessengerSupporters();
  return (
    <div className="flex flex-col gap-4 font-medium text-sm">
      <div className="my-auto flex items-center gap-2">
        <AvatarGroup max={3} size="md">
          {list &&
            list?.map((supporter: ISupporter) => (
              <Avatar
                className="border-2 border-sidebar size-10"
                size="xl"
                key={supporter._id}
              >
                <Avatar.Image
                  src={readImage(supporter.details.avatar)}
                  className="shrink-0 object-cover"
                  alt={
                    supporter.details.fullName || supporter.details.firstName
                  }
                />
                <Avatar.Fallback>
                  {supporter.details.firstName?.charAt(0) || 'C'}
                </Avatar.Fallback>
              </Avatar>
            ))}
        </AvatarGroup>
        <span className="text-muted-foreground font-medium text-sm">
          Our usual reply time
        </span>{' '}
        <mark className="bg-transparent text-primary font-medium text-sm">
          ({responseRate ? `a few ${responseRate}` : 'a few minutes'})
        </mark>
      </div>
    </div>
  );
}

export function ConversationMessage({
  conversationId,
  conversation,
}: {
  conversationId: string;
  conversation?: IConversationMessage;
}) {
  const setConversationId = useSetAtom(conversationIdAtom);
  const setActiveTab = useSetAtom(setActiveTabAtom);

  const { readConversation } = useReadConversation();
  const { messages, content } = conversation || {};
  const lastMessage = messages?.[messages.length - 1];
  const { userId, customerId, user, isCustomerRead, fromBot } =
    lastMessage || {};

  const handleClick = () => {
    readConversation({
      variables: { conversationId: conversationId },
      onCompleted: (data: ReadConversationResult) => {
        setConversationId(data.widgetsReadConversationMessages);
        setActiveTab('chat');
      },
    });
  };

  const unreadCount = useMemo(
    () =>
      messages?.filter(
        (message) => !message.isCustomerRead && message.userId !== null,
      ).length,
    [messages],
  );

  if (customerId || fromBot) {
    return (
      <div
        role="tabpanel"
        id={lastMessage?._id}
        tabIndex={0}
        className="flex items-center gap-3 cursor-pointer p-3 hover:bg-primary/5 rounded-md transition-all duration-300"
        onClick={handleClick}
      >
        <Avatar className="size-10">
          <Avatar.Image className="shrink-0 object-cover" alt={'you'} />
          <Avatar.Fallback className="bg-background">{'C'}</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col gap-1 text-sm font-medium text-muted-foreground overflow-x-hidden">
          <span
            className={cn('truncate line-clamp-1 w-auto')}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(content || ''),
            }}
          />
          <span className="text-sm text-muted-foreground">
            {'you'} ·{' '}
            {formatDateISOStringToRelativeDate(
              lastMessage?.createdAt as unknown as string,
            )}
          </span>
        </div>
      </div>
    );
  } else if (userId) {
    return (
      <div
        role="tabpanel"
        id={lastMessage?._id}
        tabIndex={0}
        className={cn(
          { 'bg-accent': !isCustomerRead },
          'flex items-center gap-3 cursor-pointer p-3 hover:bg-accent rounded-md transition-all duration-300',
        )}
        onClick={handleClick}
      >
        <Avatar className="size-10 bg-background">
          <Avatar.Image
            src={readImage(user?.details?.avatar) || 'assets/user.webp'}
            className="shrink-0 object-cover"
            alt={user?.details?.fullName}
          />
          <Avatar.Fallback>
            {user?.details?.fullName?.charAt(0) || 'C'}
          </Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col gap-1 text-sm font-medium text-muted-foreground overflow-x-hidden">
          {(unreadCount && unreadCount > 0 && (
            <span className="text-sm text-accent-foreground font-bold">
              {unreadCount > 1 ? (
                `${unreadCount} new messages`
              ) : (
                <span
                  className="text-sm text-accent-foreground font-bold"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(content || ''),
                  }}
                />
              )}
            </span>
          )) || (
              <span
                className={cn(
                  'truncate line-clamp-1 w-auto',
                  !isCustomerRead && 'text-accent-foreground font-bold',
                )}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(content || ''),
                }}
              />
            )}
          <span
            className={cn(
              { 'font-bold': !isCustomerRead },
              'text-sm text-muted-foreground',
            )}
          >
            {user?.details?.fullName || user?.details?.firstName || 'operator'}{' '}
            ·{' '}
            {formatDateISOStringToRelativeDate(
              lastMessage?.createdAt as unknown as string,
            )}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function OperatorMessage({
  content,
  src,
  createdAt,
  showAvatar = true,
  isFirstMessage,
  isLastMessage,
  isMiddleMessage,
  isSingleMessage,
  attachments,
}: {
  content: string;
  src?: string;
  createdAt: Date;
  showAvatar?: boolean;
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
  attachments?: IAttachment[];
}) {
  const isImageAttachment = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            variant="ghost"
            className="flex group/operator-message items-end justify-start gap-2 p-0 mr-auto size-auto hover:bg-transparent"
          >
            {showAvatar ? (
              <Avatar className="size-8">
                <Avatar.Image
                  src={readImage(src || 'assets/user.webp')}
                  className="shrink-0 object-cover"
                  alt="Erxes"
                />
                <Avatar.Fallback className="bg-background">C</Avatar.Fallback>
              </Avatar>
            ) : (
              <div className="size-8" />
            )}
            <div className="flex flex-col gap-2 max-w-[80%] flex-1">
              {content && content !== '<p></p>' && (
                <div
                  className={cn(
                    'h-auto font-medium flex flex-col justify-start items-start text-[13px] leading-relaxed text-foreground text-left gap-1 px-3 py-2 bg-background whitespace-break-spaces wrap-break-word break-all',
                    isFirstMessage && 'rounded-md rounded-bl-sm rounded-t-lg',
                    isLastMessage &&
                    !attachments?.length &&
                    'rounded-md rounded-tl-sm rounded-b-lg shadow-2xs',
                    isMiddleMessage && 'rounded-r-md rounded-l-sm',
                    isSingleMessage &&
                    !attachments?.length &&
                    'rounded-md shadow-2xs',
                    attachments?.length && 'rounded-t-md rounded-bl-sm',
                  )}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(content as string),
                  }}
                />
              )}
              {attachments && attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className={cn(
                        'overflow-hidden bg-background',
                        content && index === 0 && 'rounded-b-md rounded-tl-sm',
                        !content &&
                        isFirstMessage &&
                        index === 0 &&
                        'rounded-t-md rounded-bl-sm',
                        !content &&
                        isLastMessage &&
                        index === attachments.length - 1 &&
                        'rounded-b-md rounded-tl-sm',
                        !content &&
                        isSingleMessage &&
                        attachments.length === 1 &&
                        'rounded-md',
                        content &&
                        index === attachments.length - 1 &&
                        'rounded-b-md rounded-tl-sm',
                      )}
                    >
                      {isImageAttachment(attachment.url) ? (
                        <a
                          href={readImage(attachment.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={readImage(attachment.url)}
                            alt={attachment.name}
                            className="max-w-full h-auto rounded"
                          />
                        </a>
                      ) : (
                        <a
                          href={readImage(attachment.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-accent/50 transition-colors truncate"
                        >
                          <IconFile />
                          <span className="text-[13px] text-foreground truncate">
                            {attachment.name}
                          </span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {format(createdAt, 'MMM dd, yyyy hh:mm aa')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
}

export const CustomerMessage = ({
  content,
  createdAt,
  attachments,
}: {
  content?: string;
  createdAt: Date;
  attachments?: IAttachment[];
}) => {
  const isImageAttachment = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          variant="ghost"
          className="flex group/customer-message items-end max-w-[70%] justify-end size-auto gap-2 flex-row ml-auto p-0 hover:bg-transparent"
        >
          <div className="flex flex-col gap-2 w-fit">
            {content && content !== '<p></p>' && (
              <div
                className={cn(
                  'h-auto font-medium flex flex-col justify-start items-start text-[13px] leading-relaxed text-zinc-900 text-left gap-1 px-3 py-2 bg-accent shadow-2xs',
                  attachments?.length ? 'rounded-t-md' : 'rounded-md',
                )}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(content as string),
                }}
              />
            )}
            {attachments && attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className={cn(
                      'overflow-hidden bg-accent',
                      content && index === 0 && 'rounded-b-md',
                      !content && index === 0 && 'rounded-t-md',
                      !content &&
                      index === attachments.length - 1 &&
                      'rounded-b-md',
                      !content && attachments.length === 1 && 'rounded-md',
                      content &&
                      index === attachments.length - 1 &&
                      'rounded-b-md',
                    )}
                  >
                    {isImageAttachment(attachment.url) ? (
                      <a
                        href={readImage(attachment.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={readImage(attachment.url)}
                          alt={attachment.name}
                          className="max-w-full h-auto rounded"
                        />
                      </a>
                    ) : (
                      <a
                        href={readImage(attachment.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-accent/70 transition-colors truncate"
                      >
                        <IconFile />
                        <span className="text-[13px] text-zinc-900 truncate">
                          {attachment.name}
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {format(createdAt, 'MMM dd, yyyy hh:mm aa')}
      </Tooltip.Content>
    </Tooltip>
  );
};

export const BotMessage = ({ content }: { content?: string }) => {
  return (
    <div className="flex items-end gap-2">
      <div className="h-auto font-medium flex flex-col justify-start items-start text-sm leading-relaxed text-foreground text-left gap-1 p-3 bg-transparent">
        <p>{content}</p>
      </div>
    </div>
  );
};
