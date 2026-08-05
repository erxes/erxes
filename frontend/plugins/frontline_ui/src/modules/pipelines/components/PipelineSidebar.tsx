import {
  PIPELINE_TABS,
  getPipelinePath,
} from '@/pipelines/constants/pipelineTabs';
import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NavLink, useParams } from 'react-router-dom';

export const PipelineSidebar = () => {
  const { t } = useTranslation('frontline');
  const { id: channelId, pipelineId } = useParams<{
    id: string;
    pipelineId: string;
  }>();

  if (!channelId || !pipelineId) return null;

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
                <NavLink
                  end
                  to={getPipelinePath(channelId, pipelineId, segment)}
                >
                  {({ isActive }) => (
                    <Sidebar.MenuButton asChild={false} isActive={isActive}>
                      <span className="truncate">{t(labelKey)}</span>
                    </Sidebar.MenuButton>
                  )}
                </NavLink>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
