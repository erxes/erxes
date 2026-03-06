import { ChannelDetails } from '@/channels/components/settings/channel-details/ChannelDetails';
import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumb, Button, ScrollArea } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

export const ChannelDetailsPage = () => {
  const navigate = useNavigate();

  return (
    <ScrollArea className="flex-1">
      <div className="h-full flex flex-col">
        <div className="px-4 h-16 flex items-center shrink-0">
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

        <section className="mx-auto max-w-4xl w-full relative h-full flex-1 overflow-y-hidden">
          <div className="flex items-center h-full">
            <ChannelDetails />
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};
