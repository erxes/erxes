import { PipelinesList } from '@/pipelines/components/PipelinesList';
import { useNavigate, useParams } from 'react-router-dom';
import { CreatePipeline } from '@/pipelines/components/CreatePipeline';
import { Breadcrumb, Button } from 'erxes-ui';
import { IconArrowLeft } from '@tabler/icons-react';

export const ChannelPipelinesPage = () => {
  const { id: channelId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!channelId) return null;
  return (
    <div className="h-screen">
      <div className="px-4 h-16 flex items-center">
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
      </div>
      <div className="ml-auto flex justify-between px-8 py-6">
        <h1 className="text-xl font-semibold">Pipelines</h1>
        <CreatePipeline />
      </div>
      <PipelinesList channelId={channelId} />
    </div>
  );
};
