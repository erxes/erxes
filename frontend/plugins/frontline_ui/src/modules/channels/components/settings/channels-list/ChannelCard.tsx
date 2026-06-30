import { useChannelRemove } from '@/channels/hooks/useChannelRemove';
import { IChannel, IChannelMember } from '@/channels/types';
import { IntegrationType } from '@/types/Integration';
import { DateDisplay } from './ChannelsColumns';
import {
  IconDots,
  IconEdit,
  IconForms,
  IconLayoutKanban,
  IconMail,
  IconMessageFilled,
  IconMessageReply,
  IconPhone,
  IconPlugConnected,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import {
  Card,
  Combobox,
  Command,
  IconComponent,
  Popover,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import {
  FacebookIcon,
  InstagramIcon,
  MessengerIcon,
} from '@/integrations/components/Icons';
import { MembersInline } from 'ui-modules';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { FC } from 'react';

const PROVIDER_META: Record<
  string,
  { label: string; Icon: FC<any>; iconClass?: string }
> = {
  [IntegrationType.ERXES_MESSENGER]: {
    label: 'Messenger',
    Icon: IconMessageFilled,
    iconClass: 'text-indigo-500',
  },
  [IntegrationType.FACEBOOK_MESSENGER]: {
    label: 'FB Msg',
    Icon: MessengerIcon,
  },
  [IntegrationType.FACEBOOK_POST]: {
    label: 'FB Post',
    Icon: FacebookIcon,
  },
  [IntegrationType.INSTAGRAM_MESSENGER]: {
    label: 'IG Msg',
    Icon: InstagramIcon,
  },
  [IntegrationType.INSTAGRAM_POST]: {
    label: 'IG Post',
    Icon: InstagramIcon,
  },
  [IntegrationType.CALL]: {
    label: 'Call',
    Icon: IconPhone,
    iconClass: 'text-emerald-500',
  },
  [IntegrationType.IMAP]: {
    label: 'IMAP',
    Icon: IconMail,
    iconClass: 'text-amber-500',
  },
};

const MAX_CHIPS = 5;

const IntegrationChips = ({ kinds }: { kinds: string[] }) => {
  const counts: Record<string, number> = {};
  for (const k of kinds) {
    counts[k] = (counts[k] ?? 0) + 1;
  }

  const entries = Object.entries(counts).filter(([k]) => k in PROVIDER_META);
  const visible = entries.slice(0, MAX_CHIPS);
  const overflow = entries.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 pt-0.5">
      {visible.map(([kind, count]) => {
        const meta = PROVIDER_META[kind];
        if (!meta) return null;
        const { Icon, iconClass } = meta;
        return (
          <span
            key={kind}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            <Icon
              size={12}
              width={12}
              height={12}
              className={iconClass}
              style={{ flexShrink: 0 }}
            />
            <span className="font-medium text-foreground">{count}</span>
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
};

export const ChannelCard = ({
  channel,
  members,
}: {
  channel: IChannel;
  members?: IChannelMember[];
}) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const {
    _id,
    name,
    description,
    icon,
    memberCount,
    pipelineCount,
    responseTemplateCount,
    formCount,
    integrationCount,
    integrationKinds,
    createdAt,
  } = channel;

  const memberUsers = (members ?? [])
    .map((channelMember) => channelMember.member)
    .filter(Boolean);

  const openDetails = () => {
    navigate(`/settings/frontline/channels/${_id}`);
  };

  const intCount = integrationCount ?? 0;
  const hasChips = integrationKinds && integrationKinds.length > 0;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetails();
        }
      }}
      className="group flex flex-col gap-4 p-5 border border-border/60 shadow-none transition-colors cursor-pointer hover:border-border hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <IconComponent name={icon} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <Card.Title className="truncate text-sm font-medium leading-tight">
            {name}
          </Card.Title>
          <Card.Description className="mt-0.5 line-clamp-1 text-xs">
            {description || 'No description'}
          </Card.Description>
        </div>
        <ChannelCardActions channelId={_id} />
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <ChannelRow label={t('members-title')}>
          {memberUsers.length > 0 ? (
            <MembersInline.Provider members={memberUsers} size="sm">
              <MembersInline.Avatar size="sm" />
            </MembersInline.Provider>
          ) : null}
          <span className="flex items-center gap-1">
            <IconUsers size={14} className="text-muted-foreground" />
            {memberCount}
          </span>
        </ChannelRow>

        <ChannelRow label={t('pipelines')}>
          <span className="flex items-center gap-1">
            <IconLayoutKanban size={14} className="text-muted-foreground" />
            {pipelineCount ?? 0}
          </span>
        </ChannelRow>

        <ChannelRow label={t('forms')}>
          <span className="flex items-center gap-1">
            <IconForms size={14} className="text-muted-foreground" />
            {formCount ?? 0}
          </span>
        </ChannelRow>

        <ChannelRow label={t('templates')}>
          <span className="flex items-center gap-1">
            <IconMessageReply size={14} className="text-muted-foreground" />
            {responseTemplateCount ?? 0}
          </span>
        </ChannelRow>

        <div className="flex flex-col gap-1">
          <ChannelRow label={t('integrations')}>
            <span
              className="flex items-center gap-1"
              style={intCount === 0 ? { color: 'oklch(0.8 0.005 286.32)' } : undefined}
            >
              <IconPlugConnected
                size={14}
                className={intCount === 0 ? 'opacity-50' : 'text-muted-foreground'}
              />
              <span style={{ fontFamily: 'Roboto Mono, monospace' }}>
                {intCount}
              </span>
            </span>
          </ChannelRow>
          {hasChips && <IntegrationChips kinds={integrationKinds!} />}
        </div>

        <ChannelRow label={t('status')}>
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="size-1.5 rounded-full bg-success" />
            Active
          </span>
        </ChannelRow>

        <ChannelRow label={t('created')}>
          <DateDisplay date={createdAt} />
        </ChannelRow>
      </div>
    </Card>
  );
};

const ChannelRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 text-foreground">{children}</div>
    </div>
  );
};

const ChannelCardActions = ({ channelId }: { channelId: string }) => {
  const navigate = useNavigate();
  const { removeChannel, loading } = useChannelRemove();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    navigate(`/settings/frontline/channels/${channelId}`);
  };

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this channel?',
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removeChannel({ variables: { id: channelId } });
    });
  };

  return (
    <Popover>
      <Popover.Trigger
        onClick={(e) => e.stopPropagation()}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
      >
        <IconDots size={16} />
      </Popover.Trigger>
      <Combobox.Content onClick={(e) => e.stopPropagation()}>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              {loading ? <Spinner size="sm" /> : <IconTrash />} Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
