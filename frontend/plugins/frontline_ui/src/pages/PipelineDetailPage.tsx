import { Breadcrumb } from 'erxes-ui';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { PipelineDetail } from '@/pipelines/components/PipelineDetail';
import { useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';

export const PipelineDetailPage = () => {
  const { id: channelId } = useParams<{ id: string; pipelineId: string }>();

  return (
    <div>
      <div className="px-4 h-16 flex items-center">
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link asChild className="flex items-center gap-1">
                <Link
                  to={`/settings/frontline/channels/${channelId}/pipelines`}
                >
                  <Button variant="ghost">
                    <IconArrowLeft size={16} className="stroke-foreground" />
                    Pipelines
                  </Button>
                </Link>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </div>
      <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto ">
        <div className="mx-auto max-w-2xl ">
          <PipelineDetail />
        </div>
      </div>
    </div>
  );
};
