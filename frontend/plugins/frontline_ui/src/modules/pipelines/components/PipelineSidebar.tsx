import {
  PIPELINE_TABS,
  getPipelinePath,
} from '@/pipelines/constants/pipelineTabs';
import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';

export const PipelineSidebar = () => {
  const { t } = useTranslation('frontline');
  const { pathname } = useLocation();
  const { id: channelId, pipelineId } = useParams<{
    id: string;
    pipelineId: string;
  }>();

  if (!channelId || !pipelineId) return null;

  const basePath = getPipelinePath(channelId, pipelineId, '');
  const activeSegment = pathname
    .slice(basePath.length)
    .replace(/^\//, '')
    .split('/')[0];

  return (
    <Sidebar
      className="h-auto w-full flex-none border-b md:h-full md:w-52 md:border-b-0 md:border-r"
      collapsible="none"
    >
      <Sidebar.Group className="py-2 md:py-3">
        <Sidebar.GroupLabel className="hidden md:flex">
          {t('pipeline')}
        </Sidebar.GroupLabel>
        <Sidebar.GroupContent className="md:pt-2">
          <Sidebar.Menu className="flex-row overflow-x-auto md:flex-col">
            {PIPELINE_TABS.map(({ segment, labelKey }) => (
              <Sidebar.MenuItem
                className="flex-none md:flex-auto"
                key={labelKey}
              >
                <Sidebar.MenuButton
                  asChild
                  isActive={activeSegment === segment}
                >
                  <Link to={getPipelinePath(channelId, pipelineId, segment)}>
                    <span className="truncate">{t(labelKey)}</span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
