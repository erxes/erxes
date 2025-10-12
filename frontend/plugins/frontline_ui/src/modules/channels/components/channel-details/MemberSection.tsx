import { IChannel } from '@/channels/types';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const MemberSection = ({ channel }: { channel: IChannel }) => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() =>
        navigate(`/settings/frontline/channels/members/${channel._id}`)
      }
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>Manage channel members</p>

          <div className="flex items-center gap-2">
            <p className="text-xs">
              {channel.memberCount}{' '}
              {channel.memberCount === 1 ? 'member' : 'members'}
            </p>
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
