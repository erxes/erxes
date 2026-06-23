import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { IChannel } from '@/channels/types';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';

export const PipelinesSection = ({ channel }: { channel: IChannel }) => {
  const navigate = useNavigate();
  const { totalCount } = useGetPipelines({
    variables: { filter: { channelId: channel._id, limit: 1 } },
  });

  const count = totalCount ?? 0;

  return (
    <div
      className="w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() =>
        navigate(`/settings/frontline/channels/${channel._id}/pipelines`)
      }
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>Manage ticket pipelines</p>

          <div className="flex items-center gap-2">
            <p className="text-xs">
              {count} {count === 1 ? 'pipeline' : 'pipelines'}
            </p>
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
