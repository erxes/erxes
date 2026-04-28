import { useGetChannel } from '@/channels/hooks/useGetChannel';
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
