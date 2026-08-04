import { useGetChannel } from '@/channels/hooks/useGetChannel';
import {
  FACEBOOK_AUTH_SUCCESS_MESSAGE,
  INSTAGRAM_AUTH_SUCCESS_MESSAGE,
} from '@/integrations/constants/authMessages';
import { Button, IconComponent, Skeleton } from 'erxes-ui';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

export const ChannelDetailBreadcrumb = ({
  channelId,
}: {
  channelId?: string;
}) => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id === 'fb-auth' || id === 'ig-auth') {

      window.opener?.postMessage(
        {
          type:
            id === 'fb-auth'
              ? FACEBOOK_AUTH_SUCCESS_MESSAGE
              : INSTAGRAM_AUTH_SUCCESS_MESSAGE,
        },
        window.location.origin,
      );
      window.close();
    }
  }, [id]);

  const { channel, loading } = useGetChannel({
    variables: { id: channelId || id },
  });
  if (loading) {
    return <Skeleton className="w-12 h-lh" />;
  }
  return (
    <Link to={`/settings/frontline/channels/${channelId || id}`}>
      <Button variant="ghost" className="font-semibold">
        <IconComponent
          name={channel?.icon}
          className="w-4 h-4 text-accent-foreground"
        />
        {channel?.name}
      </Button>
    </Link>
  );
};
