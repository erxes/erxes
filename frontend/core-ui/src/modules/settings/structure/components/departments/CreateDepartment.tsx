import { IconFolder, IconPlus } from '@tabler/icons-react';
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
import { Can, usePermissionCheck } from 'ui-modules';

export const CreateDepartment = ({
  trigger,
  defaultParentId,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  defaultParentId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const {
    methods,
    methods: { handleSubmit },
  } = useDepartmentForm();
  const [innerOpen, setInnerOpen] = useState<boolean>(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : innerOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInnerOpen(value);
    }
  };
  const { handleAdd, loading } = useDepartmentAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageDepartments =
    isLoaded && hasActionPermission('departmentsManage');

  const onOpen = () => {
    if (defaultParentId) {
      methods.setValue('parentId', defaultParentId);
    }
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
    () => {
      if (!canManageDepartments) return;
      if (trigger || isControlled) return;
      onOpen();
    },
    DepartmentHotKeyScope.DepartmentSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    DepartmentHotKeyScope.DepartmentAddSheet,
  );

  const prevOpen = React.useRef(false);
  React.useEffect(() => {
    if (
      open &&
      defaultParentId &&
      methods.getValues('parentId') !== defaultParentId
    ) {
      methods.setValue('parentId', defaultParentId);
    }
    if (isControlled && open !== prevOpen.current) {
      if (open) {
        setHotkeyScopeAndMemorizePreviousScope(
          DepartmentHotKeyScope.DepartmentAddSheet,
        );
      } else {
        setHotkeyScope(DepartmentHotKeyScope.DepartmentSettingsPage);
      }
    }
    prevOpen.current = open;
  }, [
    open,
    isControlled,
    defaultParentId,
    methods,
    setHotkeyScopeAndMemorizePreviousScope,
    setHotkeyScope,
  ]);

  const submitHandler: SubmitHandler<TDepartmentForm> = React.useCallback(
    async (data) => {
      handleAdd({
        variables: data,
        onCompleted: () => {
          toast({
            title: 'Success!',
            variant: 'success',
            description: 'Department created successfully',
          });
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
      {!isControlled && (
        <Can action="departmentsManage">
          <Sheet.Trigger asChild>
            {trigger ?? (
              <Button>
                <IconPlus /> Create Department <Kbd>C</Kbd>
              </Button>
            )}
          </Sheet.Trigger>
        </Can>
      )}
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
