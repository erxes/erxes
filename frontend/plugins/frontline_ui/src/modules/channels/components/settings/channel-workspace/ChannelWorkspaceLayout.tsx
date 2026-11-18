import {
  ChannelWorkspaceFrame,
  ChannelWorkspaceSkeleton,
} from '@/channels/components/settings/channel-workspace/ChannelWorkspaceFrame';
import {
  ChannelWorkspaceNav,
  TWorkspaceChannel,
} from '@/channels/components/settings/channel-workspace/ChannelWorkspaceNav';
import {
  CHANNEL_SECTIONS,
  DEFAULT_CHANNEL_SECTION,
  getChannelWorkspacePaths,
  getPersonalChannelWorkspacePaths,
  PERSONAL_CHANNEL_SETTINGS_PATH,
} from '@/channels/constants/channelSections';
import { useChannelSectionCounts } from '@/channels/hooks/useChannelSectionCounts';
import { useGetChannel } from '@/channels/hooks/useGetChannel';
import { ChannelScope } from '@/channels/types';
import { channelScopeOf } from '@/channels/utils/channelScope';
import { IconCircles } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, Outlet, useParams } from 'react-router-dom';

const ChannelWorkspaceNotFound = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });

  return (
    <Empty className="flex-1">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconCircles />
        </Empty.Media>
        <Empty.Title>{t('not-found', 'Not found')}</Empty.Title>
        <Empty.Description>
          {t(
            'channel-not-found-description',
            'This channel does not exist or you no longer have access to it.',
          )}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="secondary" asChild>
          <Link to="/frontline/settings/channels">
            {t('back-to-channels', 'Back to channels')}
          </Link>
        </Button>
      </Empty.Content>
    </Empty>
  );
};

const TeamChannelNav = ({ channel }: { channel: TWorkspaceChannel }) => {
  const counts = useChannelSectionCounts(channel._id);

  return (
    <ChannelWorkspaceNav
      channel={channel}
      sections={CHANNEL_SECTIONS}
      paths={getChannelWorkspacePaths(channel._id)}
      counts={counts}
      rootSegment={DEFAULT_CHANNEL_SECTION}
    />
  );
};

const getPersonalRedirect = (channelId: string, integrationType?: string) =>
  integrationType
    ? `/${
        getPersonalChannelWorkspacePaths(channelId).integrations
      }/${integrationType}`
    : `/${PERSONAL_CHANNEL_SETTINGS_PATH}`;

export const ChannelWorkspaceLayout = () => {
  const { id, integrationType } = useParams<{
    id: string;
    integrationType: string;
  }>();
  const { channel, loading } = useGetChannel({
    variables: id ? { id } : undefined,
    skip: !id,
  });

  if (loading && !channel) return <ChannelWorkspaceSkeleton />;
  if (!channel) return <ChannelWorkspaceNotFound />;
  if (channelScopeOf(channel) === ChannelScope.PERSONAL) {
    return (
      <Navigate
        to={getPersonalRedirect(channel._id, integrationType)}
        replace
      />
    );
  }

  return (
    <ChannelWorkspaceFrame nav={<TeamChannelNav channel={channel} />}>
      <Outlet />
    </ChannelWorkspaceFrame>
  );
};
