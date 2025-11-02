import { IconPlus } from '@tabler/icons-react';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import {
  Button,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { AddTriageForm } from '@/triage/components/add-triage/AddTriageForm';
import { useAtom } from 'jotai';
import { triageCreateSheetState } from '@/triage/states/triageCreateSheetState';

export const AddTriageSheet = ({
  onComplete: onCompleteProp,
}: {
  onComplete?: (triageId: string) => void;
}) => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useAtom(triageCreateSheetState);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(TaskHotKeyScope.TaskAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(TaskHotKeyScope.TaskAddSheet);
    setOpen(false);
  };

  const onCompleteForm = (triageId: string) => {
    onClose();
    onCompleteProp?.(triageId);
  };

  useScopedHotkeys(`c`, () => onOpen(), TaskHotKeyScope.TasksPage);
  useScopedHotkeys(`esc`, () => onClose(), TaskHotKeyScope.TaskAddSheet);

  return (
    <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button variant="secondary">
          <IconPlus />
          Add triage
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-3xl w-full p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddTriageForm onComplete={onCompleteForm} />
      </Sheet.View>
    </Sheet>
  );
};
