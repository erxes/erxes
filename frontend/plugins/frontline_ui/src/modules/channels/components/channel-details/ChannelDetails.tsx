import { MemberSection } from '@/channels/components/channel-details/MemberSection';
import { UpdateChannelForm } from '@/channels/components/channel-details/UpdateChannelForm';
import { useGetChannel } from '@/channels/hooks/useGetChannel';
import { IntegrationList } from '@/integrations/components/IntegrationList';
import { useParams } from 'react-router-dom';

export const ChannelDetails = () => {
  const { id } = useParams();
  const { channel, loading } = useGetChannel({ variables: { id } });
  if (loading) return null;
  if (!channel) return <div>Not found</div>;
  return (
    <div className="w-full px-4 sm:px-8 lg:px-16 pb-16 flex max-h-full flex-col gap-4 overflow-y-auto">
      <span className="flex justify-between shrink-0">
        <h1 className="text-2xl font-semibold">{channel.name}</h1>
      </span>
      <div className="mt-4 w-full border border-muted-foreground/15 rounded-md shrink-0">
        <section className="w-full p-4">
          {channel && <UpdateChannelForm channel={channel} />}
        </section>
      </div>
      <MemberSection channel={channel} />
      <IntegrationList />
    </div>
  );
};
