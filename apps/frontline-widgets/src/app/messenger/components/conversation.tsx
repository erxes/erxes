import { useAtomValue, useSetAtom } from 'jotai';
import { readImage, formatDateISOStringToRelativeDate, cn } from 'erxes-ui';
import { Button } from 'erxes-ui';
import { Tooltip } from 'erxes-ui';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import {
  ReadConversationResult,
  useReadConversation,
} from '../hooks/useReadConversation';
import { useGetMessengerSupporters } from '../hooks/useGetMessengerSupporters';
import {
  connectionAtom,
  conversationIdAtom,
  setActiveTabAtom,
} from '../states';
import { ISupporter } from '../types';
import { Avatar } from 'erxes-ui';
import { IMessage } from '../types';
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
  message,
}: {
  conversationId: string;
  message?: IMessage;
}) {
  const setConversationId = useSetAtom(conversationIdAtom);
  const setActiveTab = useSetAtom(setActiveTabAtom);

  const { readConversation } = useReadConversation();
  const { userId, customerId, user } = message || {};

  const handleClick = () => {
    readConversation({
      variables: { conversationId: conversationId },
      onCompleted: (data: ReadConversationResult) => {
        setConversationId(data.widgetsReadConversationMessages);
        setActiveTab('chat');
      },
    });
  };

  if (customerId) {
    return (
      <div
        role="tabpanel"
        id={message?._id}
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
            className="truncate line-clamp-1 w-auto"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(message?.content || ''),
            }}
          />
          <span className="text-sm text-muted-foreground">
            {'you'} ·{' '}
            {formatDateISOStringToRelativeDate(
              message?.createdAt as unknown as string,
            )}
          </span>
        </div>
      </div>
    );
  } else if (userId) {
    return (
      <div
        role="tabpanel"
        id={message?._id}
        tabIndex={0}
        className="flex items-center gap-3 cursor-pointer p-3 hover:bg-accent rounded-md transition-all duration-300"
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
          <span
            className="truncate line-clamp-1 w-auto"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(message?.content || ''),
            }}
          />
          <span className="text-sm text-muted-foreground">
            {user?.details?.fullName || user?.details?.firstName || 'operator'}{' '}
            ·{' '}
            {formatDateISOStringToRelativeDate(
              message?.createdAt as unknown as string,
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
}: {
  content: string;
  src?: string;
  createdAt: Date;
  showAvatar?: boolean;
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
}) {
  return (
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
          <div
            className={cn(
              'h-auto font-medium flex flex-col justify-start items-start text-[13px] leading-relaxed text-foreground text-left gap-1 px-3 py-2 bg-background max-w-[70%] whitespace-break-spaces break-words break-all',
              isFirstMessage && 'rounded-md rounded-bl-sm rounded-t-lg',
              isLastMessage && 'rounded-md rounded-tl-sm rounded-b-lg',
              isMiddleMessage && 'rounded-r-md rounded-l-sm',
              isSingleMessage && 'rounded-md',
            )}
            dangerouslySetInnerHTML={{
              __html:
                content || '<p>Hello! Have you fixed your problem yet?</p>',
            }}
          />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {format(createdAt, 'MMM dd, yyyy hh:mm aa')}
      </Tooltip.Content>
    </Tooltip>
  );
}

export const CustomerMessage = ({
  content,
  createdAt,
}: {
  content?: string;
  createdAt: Date;
}) => {
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          variant="ghost"
          className="flex group/customer-message items-end size-auto gap-2 flex-row ml-auto p-0 hover:bg-transparent"
        >
          <span className="text-muted-foreground hidden group-hover/customer-message:block text-xs self-center">
            {formatDateISOStringToRelativeDate(createdAt.toISOString())}
          </span>
          <div
            className={cn(
              'h-auto font-medium flex flex-col justify-start items-start text-[13px] leading-relaxed text-zinc-900 text-left gap-1 px-3 py-2 bg-accent rounded-md',
            )}
            dangerouslySetInnerHTML={{
              __html:
                content || '<p>Hello! Have you fixed your problem yet?</p>',
            }}
          />
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
