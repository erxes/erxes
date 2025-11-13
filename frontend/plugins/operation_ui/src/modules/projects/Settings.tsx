import { Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { SettingsHeader } from 'ui-modules';
import { Button, PageContainer } from 'erxes-ui';
import { IconClipboard } from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';
import { ProjectsTagsPage } from '~/pages/ProjectsTagsPage';
import { TagProvider } from '~/modules/tags/providers/TagProvider';
import { TagsGroupsAddButtons } from '~/modules/tags/components/TagsGroupsAddButtons';

const ProjectsSettings = () => {
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
                      Projects
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
