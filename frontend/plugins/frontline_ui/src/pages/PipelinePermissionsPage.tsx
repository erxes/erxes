import { Breadcrumb, Button } from 'erxes-ui';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { Link, useParams } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { PipelinePermissionsList } from '@/pipelines/components/permissions/components/PipelinePermissionsList';

export const PipelinePermissionsPage = () => {
  const { id } = useParams<{
    id: string;
  }>();
  const { pipelineId } = useParams<{
    pipelineId: string;
  }>();
  const { pipeline } = useGetPipeline(pipelineId);
  return (
    <div className="h-full">
      <div className="h-16 flex items-center w-full px-4">
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
      <div className="w-full flex flex-col h-full overflow-hidden max-w-2xl mx-auto py-4">
        <PipelinePermissionsList />
      </div>
    </div>
  );
};
