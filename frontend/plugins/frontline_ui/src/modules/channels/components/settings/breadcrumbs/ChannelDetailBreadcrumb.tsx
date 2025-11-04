import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { IconComponent } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useGetChannel } from '@/channels/hooks/useGetChannel';
import { Skeleton } from 'erxes-ui';

export const ChannelDetailBreadcrumb = () => {
  const { id } = useParams<{ id: string }>();
  const { channel, loading } = useGetChannel({ variables: { id } });
  if (loading) {
    return <Skeleton className="w-12 h-[1lh]" />;
  }
  return (
    <Link to={`/settings/frontline/channels/${id}`}>
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
