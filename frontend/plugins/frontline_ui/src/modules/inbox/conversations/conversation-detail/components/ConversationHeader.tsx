import { useAssignConversations } from '@/inbox/conversations/hooks/useAssignConversations';
import { useConversationAutomatedReplyControl } from '@/inbox/conversations/hooks/useConversationAutomatedReplyControl';
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
  IconPlayerPause,
  IconPlayerPlay,
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
  cn,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { CustomersInline, SelectMember, SelectTags } from 'ui-modules';
import { ConversationActions } from '@/inbox/conversations/conversation-detail/components/ConversationActions';
import { useTranslation } from 'react-i18next';
import { type SyntheticEvent, useState } from 'react';

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

const AutomatedReplyStatusBadge = () => {
  const { _id, automatedReplyControl } = useConversationContext();
  const { setAutomatedReplyControl, loading } =
    useConversationAutomatedReplyControl();
  const status = automatedReplyControl?.status;

  if (!status) {
    return null;
  }

  const isActive = status === 'active';
  const label = isActive
    ? 'Automation active'
    : status === 'human_active' &&
      automatedReplyControl?.reason === 'operator_reply'
    ? 'Automation paused: operator active'
    : 'Automation paused';
  const nextStatus = isActive ? 'human_active' : 'active';
  const actionLabel = isActive ? 'Pause automation' : 'Resume automation';
  const Icon = isActive ? IconPlayerPlay : IconPlayerPause;
  const ActionIcon = isActive ? IconPlayerPause : IconPlayerPlay;

  const handleToggleAutomation = () => {
    setAutomatedReplyControl({
      variables: {
        _id,
        status: nextStatus,
        reason: 'manual',
      },
      onCompleted: () => {
        toast({
          title: isActive ? 'Automation paused' : 'Automation resumed',
        });
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-7 flex-none gap-1.5 rounded-md border px-2 text-xs font-medium shadow-none',
            isActive
              ? 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
              : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15',
          )}
          disabled={loading}
        >
          <Icon className="size-3.5 flex-none" />
          <span className="max-w-[280px] truncate">{label}</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="min-w-[220px]">
        <DropdownMenu.Item disabled={loading} onClick={handleToggleAutomation}>
          <ActionIcon className="size-4" />
          {actionLabel}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
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
      refetchQueries: ['ConversationDetail', 'Conversations'],
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
}: {
  showAssignee?: boolean;
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
      className="h-11 flex items-center px-5 text-xs font-medium text-accent-foreground flex-none gap-3 whitespace-nowrap overflow-hidden"
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
      <Separator.Inline />
      {!hideAssignee && <AssignConversation />}
      <AutomatedReplyStatusBadge />
      <div className="flex items-center gap-3 ml-auto flex-none">
        {!isCompact && <ConversationTags />}
        <IntegrationActions />
        {isCompact ? (
          <ConversationActionsDropdown showAssignee={hideAssignee} />
        ) : (
          <ConversationActions />
        )}
      </div>
    </div>
  );
};
