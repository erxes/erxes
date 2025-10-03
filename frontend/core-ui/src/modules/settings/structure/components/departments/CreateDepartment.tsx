import { IconFolder, IconGitBranch, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Kbd,
  Sheet,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
import React, { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useDepartmentForm } from '../../hooks/useDepartmentForm';
import { useDepartmentAdd } from '../../hooks/useDepartmentActions';
import { DepartmentHotKeyScope, TDepartmentForm } from '../../types/department';
import { DepartmentForm } from './DepartmentForm';

export const CreateDepartment = () => {
  const {
    methods,
    methods: { handleSubmit },
  } = useDepartmentForm();
  const [open, setOpen] = useState<boolean>(false);
  const { handleAdd, loading } = useDepartmentAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      DepartmentHotKeyScope.DepartmentAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(DepartmentHotKeyScope.DepartmentSettingsPage);
    setOpen(false);
  };

  useScopedHotkeys(
    `c`,
    () => onOpen(),
    DepartmentHotKeyScope.DepartmentSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    DepartmentHotKeyScope.DepartmentAddSheet,
  );

  const submitHandler: SubmitHandler<TDepartmentForm> = React.useCallback(
    async (data) => {
      handleAdd({
        variables: data,
        onCompleted: () => {
          toast({ title: 'Success!' });
          methods.reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [handleAdd],
  );
  return (
    <Sheet onOpenChange={(open) => (open ? onOpen() : onClose())} open={open}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus /> Create Department
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <Sheet.Header>
              <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                <IconFolder size={16} />
                Create department
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <DepartmentForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Create'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
