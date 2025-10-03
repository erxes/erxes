import { IconPlus } from '@tabler/icons-react';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { AddTaskForm } from './AddTaskForm';
import { useAtom } from 'jotai';
import { taskCreateSheetState } from '@/task/states/taskCreateSheetState';

export const AddTaskSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useAtom(taskCreateSheetState);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(TaskHotKeyScope.TaskAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(TaskHotKeyScope.TaskAddSheet);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), TaskHotKeyScope.TasksPage);
  useScopedHotkeys(`esc`, () => onClose(), TaskHotKeyScope.TaskAddSheet);

  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add task
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-3xl w-full p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddTaskForm onClose={onClose} />
      </Sheet.View>
    </Sheet>
  );
};

export const AddTaskSheetHeader = () => {
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>Add task</Sheet.Title>
      <Sheet.Description className="sr-only">
        Add a new task to your organization.
      </Sheet.Description>
      <Sheet.Close />
    </Sheet.Header>
  );
};
