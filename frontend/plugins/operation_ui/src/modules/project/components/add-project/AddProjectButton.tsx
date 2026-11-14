import { useCreateProjectRecord } from '@/project/hooks/useCreateProjectRecord';
import { ProjectHotKeyScope } from '@/project/constants/ProjectHotKeyScope';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AddProjectButton = () => {
  const { t } = useTranslation('operation');
  const { openProjectDraft } = useCreateProjectRecord();
  useScopedHotkeys(
    'c',
    () => openProjectDraft(),
    ProjectHotKeyScope.ProjectsPage,
  );

  return (
    <Button onClick={() => openProjectDraft()}>
      <IconPlus />
      {t('add-project')}
      <Kbd>C</Kbd>
    </Button>
  );
};
