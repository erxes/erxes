import { IconPlus } from '@tabler/icons-react';
import { ProjectHotKeyScope } from '@/project/constants/ProjectHotKeyScope';
import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { AddProjectForm } from './AddProjectForm';
export const AddProjectSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(ProjectHotKeyScope.ProjectAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(ProjectHotKeyScope.ProjectAddSheet);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), ProjectHotKeyScope.ProjectsPage);
  useScopedHotkeys(`esc`, () => onClose(), ProjectHotKeyScope.ProjectAddSheet);

  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add project
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-3xl w-full p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddProjectForm onClose={onClose} />
      </Sheet.View>
    </Sheet>
  );
};

export const AddProjectSheetHeader = () => {
  return (
    <Sheet.Header className="p-5">
      <Sheet.Title>Add project</Sheet.Title>
      <Sheet.Description className="sr-only">
        Add a new project to your organization.
      </Sheet.Description>
      <Sheet.Close />
    </Sheet.Header>
  );
};
