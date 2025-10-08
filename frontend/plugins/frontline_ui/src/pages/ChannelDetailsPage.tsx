import { ChannelDetails } from '@/channels/components/channel-details/ChannelDetails';
import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

export const ChannelDetailsPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="px-4 h-16 flex items-center">
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link asChild className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  className="text-foreground font-semibold"
                  onClick={() => navigate('/settings/frontline/channels')}
                >
                  <IconArrowLeft size={16} className="stroke-foreground" />
                  Channels
                </Button>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </div>

      <section className="mx-auto max-w-4xl w-full relative">
        <div className="flex items-center">
          <ChannelDetails />
        </div>
      </section>
    </div>
  );
};
