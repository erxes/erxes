import { IChannel } from '@/channels/types';
import { useFormsTotalCount } from '@/forms/hooks/useFormsTotalCount';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const FormsSection = ({ channel }: { channel: IChannel }) => {
  const navigate = useNavigate();
  const { total } = useFormsTotalCount({
    variables: {
      channelId: channel._id,
    },
  });

  return (
    <div
      className="w-full shrink-0 border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() =>
        navigate(`/settings/frontline/channels/${channel._id}/forms`)
      }
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>Manage channel forms</p>

          <div className="flex items-center gap-2">
            <p className="text-xs">
              {total}{' '}
              {total === 1 ? 'form' : 'forms'}
            </p>
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
