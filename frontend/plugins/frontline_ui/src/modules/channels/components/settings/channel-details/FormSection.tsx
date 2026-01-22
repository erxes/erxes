import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { IChannel } from '@/channels/types';

export const FormSection = ({ channel }: { channel: IChannel }) => {
  const navigate = useNavigate();
  return (
    <div
      className="w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() => navigate(`/settings/frontline/forms/${channel._id}`)}
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>Manage channel forms</p>

          <div className="flex items-center gap-2">
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
