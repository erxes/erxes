import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { Statuses } from '@/status/components/Statuses';
import { IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';

export const TicketStatusesPage = () => {
  const { id } = useParams<{
    id: string;
  }>();
  const { pipelineId } = useParams<{
    pipelineId: string;
  }>();
  const { pipeline } = useGetPipeline(pipelineId);
  return (
    <div className="h-full overflow-auto">
      <div className="px-4 h-16 flex items-center">
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item className="shrink-0">
              <Breadcrumb.Link asChild className="flex items-center gap-1">
                <Link
                  to={`/settings/frontline/channels/${id}/pipelines/${pipelineId}`}
                >
                  <Button variant="ghost">
                    <IconArrowLeft size={16} className="stroke-foreground" />
                    {pipeline?.name}
                  </Button>
                </Link>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </div>
      <section className="mx-auto max-w-2xl">
        <div className="flex items-center">
          <Statuses />
        </div>
      </section>
    </div>
  );
};
