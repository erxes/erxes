import { useChannelRemove } from '@/channels/hooks/useChannelRemove';
import { IChannel, IChannelMember } from '@/channels/types';
import { DateDisplay } from './ChannelsColumns';
import {
  IconDots,
  IconEdit,
  IconLayoutKanban,
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
import { MembersInline } from 'ui-modules';
import { useNavigate } from 'react-router-dom';

export const ChannelCard = ({
  channel,
  members,
}: {
  channel: IChannel;
  members?: IChannelMember[];
}) => {
  const navigate = useNavigate();
  const { _id, name, description, icon, memberCount, pipelineCount, createdAt } =
    channel;

  const memberUsers = (members ?? [])
    .map((channelMember) => channelMember.member)
    .filter(Boolean);

  const openDetails = () => {
    navigate(`/settings/frontline/channels/${_id}`);
  };

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
      className="group flex flex-col gap-3 p-4 border border-border transition-colors hover:border-primary/40 hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconComponent name={icon} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <Card.Title className="truncate text-sm font-semibold leading-tight">
            {name}
          </Card.Title>
          {description && (
            <Card.Description className="mt-0.5 line-clamp-2 text-xs">
              {description}
            </Card.Description>
          )}
        </div>
        <ChannelCardActions channelId={_id} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {memberUsers.length > 0 ? (
            <MembersInline.Provider members={memberUsers} size="sm">
              <MembersInline.Avatar size="sm" />
            </MembersInline.Provider>
          ) : null}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconUsers size={14} />
            {memberCount}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconLayoutKanban size={14} />
            {pipelineCount}
          </span>
        </div>
        <DateDisplay date={createdAt} />
      </div>
    </Card>
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
