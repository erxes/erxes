import { useCreateTaskRecord } from '@/task/hooks/useCreateTaskRecord';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * Opens a new task in this page's team/project as a draft in the side
 * panel; it is created once named.
 */
export const AddTaskButton = () => {
  const { t } = useTranslation('operation');
  const { openTaskDraft } = useCreateTaskRecord();

  useScopedHotkeys(`c`, () => openTaskDraft(), TaskHotKeyScope.TasksPage);

  return (
    <Button onClick={() => openTaskDraft()}>
      <IconPlus />
      {t('add-task')}
      <Kbd>C</Kbd>
    </Button>
  );
};
