import { Breadcrumb } from 'erxes-ui';
import { IconArrowLeft } from '@tabler/icons-react';

import { PipelineDetail } from '@/settings/components/pipelines/PipelineDetail';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';

export const PipelineDetailPage = () => {
  const navigate = useNavigate();
  const { id: channelId } = useParams<{ id: string; pipelineId: string }>();

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
                  onClick={() =>
                    navigate(
                      `/settings/frontline/channels/${channelId}/pipelines`,
                    )
                  }
                >
                  <IconArrowLeft size={16} className="stroke-foreground" />
                  Pipelines
                </Button>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </div>
      <section className="mx-auto max-w-2xl w-full relative">
        <div className="flex items-center">
          <PipelineDetail />
        </div>
      </section>
    </div>
  );
};
