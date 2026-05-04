import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { IChannel } from '@/channels/types';

export const ResponseSection = ({ channel }: { channel: IChannel }) => {
  const navigate = useNavigate();
  return (
    <div
      className="w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() =>
        navigate(`/settings/frontline/channels/${channel._id}/response`)
      }
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>Manage channel response templates</p>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <p className="text-xs ">{channel.responseTemplateCount}</p>
              <p className="text-xs ">
                {channel.responseTemplateCount === 1 ? 'response' : 'responses'}
              </p>
            </span>
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
