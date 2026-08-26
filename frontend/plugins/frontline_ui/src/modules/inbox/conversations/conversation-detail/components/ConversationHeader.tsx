import { useAssignConversations } from '@/inbox/conversations/hooks/useAssignConversations';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { useDiscordConversationChannel } from '@/integrations/discord/hooks/useDiscordSetup';
import { IntegrationType } from '@/types/Integration';
import { useChangeConversationStatus } from '@/inbox/conversations/hooks/useChangeConversationStatus';
import { useConversationListVisibility } from '@/inbox/hooks/useConversationListVisibility';
import { useInboxLayout } from '@/inbox/hooks/useInboxLayout';
import { useOverflowCompact } from '@/inbox/hooks/useCompactWidth';
import { refetchConversationsAtom } from '@/inbox/conversations/states/refetchConversationState';
import { ConversationStatus } from '@/inbox/types/Conversation';
import { IntegrationActions } from '@/integrations/components/IntegrationActions';
import {
  IconArrowLeft,
  IconCircleCheck,
  IconCircleDashed,
  IconDots,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconTags,
  IconUser,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Combobox,
  DropdownMenu,
  PopoverScoped,
  Separator,
  Skeleton,
  Tooltip,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { CustomersInline, SelectMember, SelectTags } from 'ui-modules';
import { ConversationActions } from '@/inbox/conversations/conversation-detail/components/ConversationActions';
import { useTranslation } from 'react-i18next';
import { type SyntheticEvent, useState } from 'react';
import {
  AutomatedReplyMenuItem,
  AutomatedReplyStatusBadge,
} from '@/inbox/conversations/conversation-detail/components/conversation-header/AutomatedReplyActions';

const stopEventPropagation = (event: SyntheticEvent) => {
  event.stopPropagation();
};

const ConversationListToggle = () => {
  const { t } = useTranslation('frontline');
  const { isHidden, toggle } = useConversationListVisibility();
  const Icon = isHidden
    ? IconLayoutSidebarLeftExpand
    : IconLayoutSidebarLeftCollapse;
  const label = t(isHidden ? 'show-conversations' : 'hide-conversations');

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Button
            aria-label={label}
            variant="secondary"
            size="icon"
            className="[&>svg]:size-4 text-foreground flex-none"
            onClick={toggle}
          >
            <Icon />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>{label}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

const ConversationHeaderProfile = () => {
  const { _id, integration, customer, customerId } = useConversationContext();
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const { channel, loading } = useDiscordConversationChannel(
    _id,
    !_id || !isDiscord,
  );

  if (isDiscord && loading && !channel?.channelName) {
    return (
      <div className="flex items-center gap-2 flex-none">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="w-32 h-4" />
      </div>
    );
  }

  if (isDiscord && channel?.channelName) {
    const letter = channel.channelName.trim().charAt(0).toUpperCase();
    return (
      <div className="flex items-center gap-2 flex-none">
        <Avatar size="lg">
          <Avatar.Fallback className="bg-primary/10 text-primary font-medium">
            {letter}
          </Avatar.Fallback>
        </Avatar>
        <span
          className="text-sm text-foreground"
          title={`Discord channel: #${channel.channelName}`}
        >
          #{channel.channelName}
        </span>
      </div>
    );
  }

  return (
    <CustomersInline
      customers={customer ? [customer] : undefined}
      customerIds={customerId ? [customerId] : undefined}
      className="text-sm text-foreground flex-none"
      placeholder="anonymous customer"
    />
  );
};

const AssignConversation = ({
  withinDropdown = false,
}: {
  withinDropdown?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const { assignedUserId, _id } = useConversationContext();
  const { assignConversations } = useAssignConversations();
  const [open, setOpen] = useState(false);

  const handleAssignConversations = (value: null | string | string[]) => {
    const result = Array.isArray(value) ? value[value.length - 1] : value;

    assignConversations({
      variables: {
        conversationIds: [_id],
        assignedUserId: result,
      },
      onError: (error: Error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: [
        'ConversationDetail',
        'Conversations',
        'ConversationCounts',
        'FrontlineInboxSidebarWorkCounts',
      ],
    });
  };

  return (
    <div className="flex">
      <SelectMember.Provider
        mode="single"
        value={assignedUserId}
        onValueChange={(value) => {
          handleAssignConversations(value);
          setOpen(false);
        }}
      >
        <PopoverScoped open={open} onOpenChange={setOpen}>
          <Combobox.Trigger
            className="text-foreground shadow-none px-2"
            variant="outline"
            onPointerDown={withinDropdown ? stopEventPropagation : undefined}
            onClick={withinDropdown ? stopEventPropagation : undefined}
            onKeyDown={withinDropdown ? stopEventPropagation : undefined}
          >
            <SelectMember.Value size="lg" />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectMember.Content />
          </Combobox.Content>
        </PopoverScoped>
      </SelectMember.Provider>
    </div>
  );
};

export const ConversationTags = ({
  showAllTags = false,
  withinDropdown = false,
}: {
  showAllTags?: boolean;
  withinDropdown?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, tagIds, setTagIds } = useConversationContext();
  const TagSelector = showAllTags
    ? SelectTags.Detail
    : SelectTags.ConversationDetail;

  if (!_id) return null;

  const handleTagChange = (newTagIds: string[] | string) => {
    const ids = Array.isArray(newTagIds) ? newTagIds : [newTagIds];

    setTagIds?.(ids);
  };

  return (
    <div className="flex-none">
      <TagSelector
        tagType="frontline:conversation"
        mode="multiple"
        value={tagIds}
        targetIds={[_id]}
        onValueChange={handleTagChange}
        options={() => ({
          onCompleted: () => {
            toast({
              title: t('tag-updated'),
              variant: 'default',
            });
          },
          onError: (error: Error) => {
            toast({
              title: t('failed-to-update-tags'),
              description: error.message,
              variant: 'destructive',
            });
          },
        })}
        onPointerDown={withinDropdown ? stopEventPropagation : undefined}
        onClick={withinDropdown ? stopEventPropagation : undefined}
        onKeyDown={withinDropdown ? stopEventPropagation : undefined}
      />
    </div>
  );
};

const ConversationActionsDropdown = ({
  showAssignee = false,
  showAutomation = false,
}: {
  showAssignee?: boolean;
  showAutomation?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, status } = useConversationContext();
  const { changeConversationStatus, loading } = useChangeConversationStatus();
  const refetchConversations = useAtomValue(refetchConversationsAtom);
  const isClosed = status === ConversationStatus.CLOSED;
  const StatusIcon = isClosed ? IconCircleDashed : IconCircleCheck;

  const handleStatusChange = () => {
    changeConversationStatus({
      variables: {
        ids: [_id],
        status:
          status === ConversationStatus.CLOSED
            ? ConversationStatus.OPEN
            : ConversationStatus.CLOSED,
      },
    });
    if (refetchConversations) {
      refetchConversations();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="flex-none [&>svg]:size-4"
          aria-label={t('actions')}
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        className="w-80 max-w-[calc(100vw-1rem)] p-1.5"
      >
        {showAutomation && <AutomatedReplyMenuItem />}
        {showAssignee && (
          <>
            <DropdownMenu.Label className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
              <IconUser className="size-4" />
              {t('assignee')}
            </DropdownMenu.Label>
            <div className="px-1 pb-2">
              <AssignConversation withinDropdown />
            </div>
            <DropdownMenu.Separator />
          </>
        )}
        <DropdownMenu.Label className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
          <IconTags className="size-4" />
          {t('tags')}
        </DropdownMenu.Label>
        <div className="px-1 pb-2 [&>div]:flex-col [&>div]:items-stretch [&>div>button]:order-last [&>div>button]:mt-2 [&>div>button]:w-full [&>div>button]:justify-between [&>div>button]:border-dashed [&>div>button]:bg-muted/30 [&>div>div]:max-h-28 [&>div>div]:w-full [&>div>div]:overflow-y-auto [&>div>div]:pr-1">
          <ConversationTags showAllTags withinDropdown />
        </div>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="mt-1 gap-2"
          onSelect={handleStatusChange}
          disabled={loading}
        >
          <StatusIcon className="size-4" />
          {isClosed ? t('open-label') : t('resolve')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const ConversationHeader = () => {
  const { loading } = useConversationContext();
  const [, setConversationId] = useQueryState<string>('conversationId');
  const view = useInboxLayout();
  const {
    ref: headerRef,
    isCompact,
    compactLevel,
  } = useOverflowCompact<HTMLDivElement>();
  const hideAssignee = compactLevel === 2;

  return (
    <div
      ref={headerRef}
      className="h-14 flex items-center border-b bg-background px-4 text-xs font-medium text-accent-foreground flex-none gap-3 whitespace-nowrap overflow-hidden"
    >
      {view === 'list' ? (
        <Button
          variant="secondary"
          size="icon"
          className="[&>svg]:size-4 text-foreground flex-none"
          onClick={() => setConversationId(null)}
        >
          <IconArrowLeft />
        </Button>
      ) : (
        <ConversationListToggle />
      )}
      {!loading ? (
        <ConversationHeaderProfile />
      ) : (
        <Skeleton className="w-32 h-4 ml-2" />
      )}
      <Separator.Inline className="h-6" />
      {!hideAssignee && <AssignConversation />}
      {!isCompact && <AutomatedReplyStatusBadge />}
      <div className="flex items-center gap-3 ml-auto flex-none">
        {!isCompact && <ConversationTags />}
        <IntegrationActions />
        {isCompact ? (
          <ConversationActionsDropdown
            showAssignee={hideAssignee}
            showAutomation
          />
        ) : (
          <ConversationActions />
        )}
      </div>
    </div>
  );
};
