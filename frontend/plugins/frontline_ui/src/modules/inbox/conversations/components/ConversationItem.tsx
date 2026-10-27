import { useConversationPreviewTranslation } from '../translations';
import { conversationMessagePreview } from '../utils/conversationMessagePreview';
import {
  Avatar,
  BlockEditorReadOnly,
  Button,
  Checkbox,
  cn,
  RelativeDateDisplay,
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
  readImage,
  useMultiQueryState,
} from 'erxes-ui';
import {
  IconInbox,
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconPhoneX,
} from '@tabler/icons-react';
import { useConversationContext } from '../hooks/useConversationContext';
import { currentUserState, CustomersInline, MembersInline } from 'ui-modules';
import { IntegrationType } from '@/types/Integration';
import {
  CALL_STATUS_LABEL_KEYS,
  NOT_ANSWERED_STATUSES,
  parseCallConversationContent,
} from '@/integrations/call/utils/callContentUtils';
import { useAtomValue, useSetAtom } from 'jotai';
import { activeConversationState } from '../states/activeConversationState';
import { useEffect, useState } from 'react';
import {
  selectConversationsState,
  setSelectConversationsState,
} from '../states/selectConversationsState';
import { useInboxLayout } from '@/inbox/hooks/useInboxLayout';
import { useTranslation } from 'react-i18next';
import { INTEGRATION_ICONS } from '@/integrations/constants/integrationImages';
import {
  conversationAssigneeIds,
  conversationAssignees,
  integrationAppearance,
} from '../utils/conversationDisplay';
import { ConversationIdleIndicator } from './ConversationIdleIndicator';

export const ConversationItem = ({
  onConversationSelect,
  channelInfo,
  channelInfoPending,
}: {
  onConversationSelect: () => void;
  channelInfo?: { channelName?: string };
  channelInfoPending?: boolean;
}) => {
  const conversation = useConversationContext();
  const { createdAt, updatedAt, customer, integration } = conversation;
  const split = useInboxLayout() === 'split';
  const appearance = integrationAppearance(integration?.kind);
  const Icon = INTEGRATION_ICONS[integration?.kind ?? ''] ?? IconInbox;
  const profile = channelInfo?.channelName;
  let title = (
    <CustomersInline.Title className="min-w-0 text-sm font-semibold text-foreground" />
  );
  if (channelInfoPending) title = <Skeleton className="h-4 w-3/4" />;
  else if (profile)
    title = (
      <TextOverflowTooltip
        value={`#${profile}`}
        className="min-w-0 text-sm font-semibold text-foreground"
      />
    );
  return (
    <ConversationContainer
      onConversationSelect={onConversationSelect}
      className={cn(
        '@container gap-3 py-3',
        split ? 'h-auto items-start px-4' : 'h-auto min-h-16',
      )}
    >
      <CustomersInline.Provider customers={customer ? [customer] : []}>
        <ConversationSelector
          channelLetter={profile?.trim()[0]?.toUpperCase()}
          isPending={channelInfoPending}
        />
        <div
          className={cn(
            'grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 text-left',
            !split &&
              '@min-[640px]:grid-cols-[minmax(180px,260px)_minmax(0,1fr)_72px] @min-[640px]:gap-x-6',
          )}
        >
          <div
            className={cn(
              'col-start-1 row-start-1 min-w-0',
              !split && '@min-[640px]:row-span-2',
            )}
          >
            {title}
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-normal text-muted-foreground">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md',
                  appearance.avatarClass,
                )}
              >
                <Icon className="size-3" />
              </span>
              <span className="shrink-0">{appearance.label}</span>
              {integration?.channel?.name && (
                <>
                  <span aria-hidden>·</span>
                  <TextOverflowTooltip
                    className="min-w-0 truncate"
                    value={integration.channel.name}
                  />
                </>
              )}
            </div>
          </div>
          <span
            className={cn(
              'col-start-2 row-start-1 justify-self-end text-[11px] font-normal tabular-nums text-muted-foreground',
              !split && '@min-[640px]:col-start-3',
            )}
          >
            {(updatedAt || createdAt) && (
              <RelativeDateDisplay value={updatedAt || createdAt || ''}>
                <RelativeDateDisplay.Value
                  value={updatedAt || createdAt || ''}
                  isShort
                />
              </RelativeDateDisplay>
            )}
          </span>
          <div
            className={cn(
              'col-start-1 row-start-2 flex min-w-0 items-center',
              !split &&
                '@min-[640px]:col-start-2 @min-[640px]:row-start-1 @min-[640px]:row-span-2',
            )}
          >
            <ConversationItemContent />
          </div>
          <div
            className={cn(
              'col-start-2 row-start-2 justify-self-end',
              !split && '@min-[640px]:col-start-3',
            )}
          >
            <ConversationAssignees />
          </div>
        </div>
      </CustomersInline.Provider>
    </ConversationContainer>
  );
};

const ConversationAssignees = () => {
  const conversation = useConversationContext();
  const ids = conversationAssigneeIds(conversation);
  if (!ids.length) return null;
  const members = conversationAssignees(conversation);
  return (
    <div className="ml-auto flex shrink-0 items-center -space-x-1">
      {ids.slice(0, 2).map((id) => (
        <MembersInline.Provider
          key={id}
          memberIds={[id]}
          members={members}
          size="sm"
          showInactive
        >
          <MembersInline.Avatar size="sm" className="ring-2 ring-background" />
        </MembersInline.Provider>
      ))}
      {ids.length > 2 && (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(event) => event.stopPropagation()}
              className="p-0 flex size-5 items-center justify-center rounded-full bg-muted text-[10px] ring-2 ring-background"
            >
              +{ids.length - 2}
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {members
              .map(
                (member) =>
                  member.details?.fullName ||
                  member.email ||
                  member.username ||
                  member._id,
              )
              .join(', ')}
          </Tooltip.Content>
        </Tooltip>
      )}
    </div>
  );
};

export const ConversationItemContent = () => {
  const conversation = useConversationContext();
  const { integration } = conversation;
  const { t: translatePreview } = useConversationPreviewTranslation();
  const { content, label, labelKey, count } =
    conversationMessagePreview(conversation);
  if (!content)
    return (
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
        {labelKey ? translatePreview(labelKey, count) : label}
      </span>
    );
  const call =
    integration?.kind === IntegrationType.CALL ||
    content.includes('callDirection/')
      ? parseCallConversationContent(content)
      : null;
  if (call) return <ConversationCallPreview call={call} />;
  return (
    <div className="min-w-0 flex-1 overflow-hidden h-4 text-left **:text-left! **:truncate [&_p]:w-full **:text-xs **:leading-tight **:font-normal">
      <BlockEditorReadOnly content={content} />
    </div>
  );
};

const ConversationCallPreview = ({
  call,
}: {
  call: NonNullable<ReturnType<typeof parseCallConversationContent>>;
}) => {
  const { t } = useTranslation('frontline');
  const { direction, status } = call;
  const missed = Boolean(status && NOT_ANSWERED_STATUSES.includes(status));
  let Icon = direction === 'incoming' ? IconPhoneIncoming : IconPhoneOutgoing;
  let color = status === 'answered' ? 'text-success' : 'text-muted-foreground';
  if (missed) {
    Icon = IconPhoneX;
    color = 'text-destructive';
  }
  return (
    <div
      className={cn('flex min-w-0 flex-1 items-center gap-1 text-xs', color)}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">
        {direction === 'incoming'
          ? t('incoming-call', 'Incoming call')
          : t('outgoing-call', 'Outgoing call')}
        {status && ` · ${t(CALL_STATUS_LABEL_KEYS[status])}`}
      </span>
    </div>
  );
};

const ConversationContainer = ({
  children,
  className,
  onConversationSelect,
}: {
  children: React.ReactNode;
  className?: string;
  onConversationSelect: () => void;
}) => {
  const [{ conversationId }, setValues] = useMultiQueryState<{
    conversationId: string;
  }>(['conversationId']);
  const setActiveConversation = useSetAtom(activeConversationState);
  const conversation = useConversationContext();
  const { _id, readUserIds } = conversation;
  const currentUser = useAtomValue(currentUserState);
  const isRead = readUserIds?.includes(currentUser?._id || '');
  return (
    <Button
      variant="ghost"
      size="lg"
      asChild
      className={cn(
        'relative flex rounded-none justify-start px-4 gap-3 transition-colors hover:bg-primary/5 hover:text-foreground w-full overflow-hidden border-b border-border/40 border-l-2 border-l-transparent',
        isRead && 'text-muted-foreground',
        className,
        conversationId === _id &&
          'border-l-primary bg-primary/10 text-foreground hover:bg-primary/10',
      )}
      onClick={() => {
        setActiveConversation(conversation);
        setValues({ conversationId: _id });
        onConversationSelect();
      }}
    >
      <div>
        {children}
        <ConversationIdleIndicator conversation={conversation} />
      </div>
    </Button>
  );
};

const ConversationSelector = ({
  channelLetter,
  isPending,
}: {
  channelLetter?: string;
  isPending?: boolean;
}) => {
  const { customer, integration } = useConversationContext();
  const appearance = integrationAppearance(integration?.kind);
  const name =
    channelLetter ||
    customer?.firstName ||
    customer?.lastName ||
    customer?.primaryEmail ||
    '?';
  return (
    <div className="group relative grid size-9 shrink-0 place-items-center">
      <ConversationCheckbox />
      <div className="relative size-full transition-opacity group-hover:opacity-0 peer-data-[state=checked]:opacity-0">
        {isPending ? (
          <Skeleton className="size-9 rounded-full" />
        ) : (
          <Avatar className="size-9">
            {!channelLetter && customer?.avatar && (
              <Avatar.Image src={readImage(customer.avatar, 80)} />
            )}
            <Avatar.Fallback
              className={cn('font-semibold', appearance.avatarClass)}
            >
              {name[0].toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

const ConversationCheckbox = () => {
  const { _id } = useConversationContext();
  const [isChecked, setIsChecked] = useState(false);
  const setSelectConversations = useSetAtom(setSelectConversationsState);

  return (
    <>
      <Checkbox
        checked={isChecked}
        className="absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 z-10"
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={() => setSelectConversations(_id || '')}
      />
      <ConversationCheckedEffect
        isChecked={isChecked}
        setIsChecked={setIsChecked}
      />
    </>
  );
};

const ConversationCheckedEffect = ({
  isChecked,
  setIsChecked,
}: {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
}) => {
  const { _id } = useConversationContext();
  const selectConversations = useAtomValue(selectConversationsState);

  useEffect(() => {
    if (isChecked !== selectConversations.includes(_id || '')) {
      setIsChecked(selectConversations.includes(_id || ''));
    }
  }, [selectConversations, _id, isChecked, setIsChecked]);

  return null;
};
