import {
  ChannelWorkspaceFrame,
  ChannelWorkspaceSkeleton,
} from '@/channels/components/settings/channel-workspace/ChannelWorkspaceFrame';
import { ChannelWorkspaceNav } from '@/channels/components/settings/channel-workspace/ChannelWorkspaceNav';
import {
  getPersonalChannelWorkspacePaths,
  PERSONAL_CHANNEL_SECTIONS,
} from '@/channels/constants/channelSections';
import { useGetPersonalChannel } from '@/channels/hooks/useGetPersonalChannel';
import { IconAlertTriangle, IconLock } from '@tabler/icons-react';
import { Badge, Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

const PersonalChannelUnavailable = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });

  return (
    <Empty className="flex-1">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAlertTriangle />
        </Empty.Media>
        <Empty.Title>
          {t('personal-channel-unavailable', 'Personal inbox unavailable')}
        </Empty.Title>
        <Empty.Description>{message}</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="secondary" onClick={onRetry}>
          {t('try-again', 'Try again')}
        </Button>
      </Empty.Content>
    </Empty>
  );
};

const PrivateBadge = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });

  return (
    <Badge variant="secondary" className="h-5 shrink-0 gap-1 px-1.5 text-xs">
      <IconLock className="size-3" />
      {t('private', 'Private')}
    </Badge>
  );
};

export const PersonalChannelLayout = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { channel, loading, error, refetch } = useGetPersonalChannel();

  if (loading && !channel) return <ChannelWorkspaceSkeleton />;
  if (!channel) {
    return (
      <PersonalChannelUnavailable
        message={
          error?.message ?? t('no-personal-inbox', 'No personal inbox yet')
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <ChannelWorkspaceFrame
      nav={
        <ChannelWorkspaceNav
          channel={channel}
          sections={PERSONAL_CHANNEL_SECTIONS}
          paths={getPersonalChannelWorkspacePaths(channel._id)}
          badge={<PrivateBadge />}
        />
      }
    >
      <Outlet />
    </ChannelWorkspaceFrame>
  );
};
