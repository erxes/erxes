import { ResponseList } from '@/responseTemplate/components/ResponseList';
import { useParams, useNavigate } from 'react-router-dom';
import { CreateResponse } from '@/responseTemplate/components/CreateResponse';
import { Breadcrumb, ScrollArea, Button } from 'erxes-ui';
import { IconArrowLeft } from '@tabler/icons-react';

export const ChannelResponsePage = () => {
  const { id: channelId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!channelId) return null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header section */}
      <div className="px-4 h-16 flex items-center justify-between">
        {' '}
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link asChild className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  className="text-foreground font-semibold"
                  onClick={() => navigate(-1)}
                >
                  <IconArrowLeft size={16} className="stroke-foreground" />
                  Channel Settings
                </Button>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <CreateResponse />
      </div>

      <div className="px-8 py-4">
        <div className="mb-6">
          {' '}
          <h1 className="text-xl font-semibold">Response Templates</h1>
        </div>

        <ScrollArea className="flex-1">
          <ResponseList channelId={channelId} />
        </ScrollArea>
      </div>
    </div>
  );
};
