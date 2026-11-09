import {
  getPipelinePath,
  PIPELINE_TABS,
} from '@/pipelines/constants/pipelineTabs';
import { Navigate, useLocation, useParams } from 'react-router-dom';

export const PipelineLayoutPage = () => {
  const { id: channelId, pipelineId } = useParams<{
    id: string;
    pipelineId: string;
  }>();
  const { pathname, search } = useLocation();
  if (!channelId || !pipelineId) return null;
  const lastSegment = pathname
    .split('/')
    .reduce((last, segment) => segment || last, '');
  const segment =
    PIPELINE_TABS.find((tab) => tab.segment === lastSegment)?.segment ?? '';
  const destination = getPipelinePath(channelId, pipelineId, segment);
  const [path, panelSearch] = destination.split('?');
  const params = new URLSearchParams(search);
  const panel = new URLSearchParams(panelSearch).get('panel');
  if (panel) params.set('panel', panel);
  return <Navigate to={`${path}?${params}`} replace />;
};
