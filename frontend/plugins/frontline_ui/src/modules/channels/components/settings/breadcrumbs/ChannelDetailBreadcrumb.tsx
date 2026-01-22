import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { IconComponent } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useGetChannel } from '@/channels/hooks/useGetChannel';
import { Skeleton } from 'erxes-ui';
import { useEffect } from 'react';

export const ChannelDetailBreadcrumb = ({
  channelId,
}: {
  channelId?: string;
}) => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id === 'fb-auth') {
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
