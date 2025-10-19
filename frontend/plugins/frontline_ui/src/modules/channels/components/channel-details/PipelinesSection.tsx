import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const PipelinesSection = ({ channelId }: { channelId: string }) => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() => navigate(`/settings/frontline/channels/${channelId}/pipelines`)}
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>Manage channel pipelines</p>

          <div className="flex items-center gap-2">
            <p className="text-xs">
              {/* {channel.pipelineCount}{' '}
              {channel.pipelineCount === 1 ? 'pipeline' : 'pipelines'} */}
            </p>
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
