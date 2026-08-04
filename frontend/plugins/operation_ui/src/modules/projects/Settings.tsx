import { useTranslation } from 'react-i18next';
import { IconClipboard } from '@tabler/icons-react';
import { Button, PageContainer } from 'erxes-ui';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Outlet } from 'react-router-dom';
import { SettingsHeader, TagProvider, TagsGroupsAddButtons } from 'ui-modules';
import { ProjectsTagsPage } from '~/pages/ProjectsTagsPage';

const ProjectsSettings = () => {
  const { t } = useTranslation('operation');
  return (
    <Suspense fallback={<div />}>
      <TagProvider>
        <Routes>
          <Route
            element={
              <PageContainer>
                <SettingsHeader
                  breadcrumbs={
                    <Button variant="ghost" className="font-semibold">
                      <IconClipboard className="w-4 h-4 text-accent-foreground" />
                      {t('projects')}
                    </Button>
                  }
                >
                  <div className="ml-auto">
                    <TagsGroupsAddButtons />
                  </div>
                </SettingsHeader>
                <Outlet />
              </PageContainer>
            }
          >
            <Route path="/" element={<ProjectsTagsPage />} />
          </Route>
        </Routes>
      </TagProvider>
    </Suspense>
  );
};

export default ProjectsSettings;
