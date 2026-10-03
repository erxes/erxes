import { IconPlus, IconUsersGroup } from '@tabler/icons-react';
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
import { useUnitForm } from '../../hooks/useUnitForm';
import { useUnitAdd } from '../../hooks/useUnitActions';
import { TUnitForm, UnitHotKeyScope } from '../../types/unit';
import { UnitForm } from './UnitForm';
import { Can, usePermissionCheck } from 'ui-modules';

export const CreateUnit = ({
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
  } = useUnitForm();
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
  const { handleAdd, loading } = useUnitAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageUnits = isLoaded && hasActionPermission('unitsManage');

  const onOpen = () => {
    if (defaultParentId) {
      methods.setValue('departmentId', defaultParentId);
    }
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(UnitHotKeyScope.UnitAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(UnitHotKeyScope.UnitSettingsPage);
    setOpen(false);
  };

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageUnits) return;
      if (trigger || isControlled) return;
      onOpen();
    },
    UnitHotKeyScope.UnitSettingsPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), UnitHotKeyScope.UnitAddSheet);

  const prevOpen = React.useRef(false);
  React.useEffect(() => {
    if (
      open &&
      defaultParentId &&
      methods.getValues('departmentId') !== defaultParentId
    ) {
      methods.setValue('departmentId', defaultParentId);
    }
    if (isControlled && open !== prevOpen.current) {
      if (open) {
        setHotkeyScopeAndMemorizePreviousScope(UnitHotKeyScope.UnitAddSheet);
      } else {
        setHotkeyScope(UnitHotKeyScope.UnitSettingsPage);
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

  const submitHandler: SubmitHandler<TUnitForm> = React.useCallback(
    async (data) => {
      handleAdd({
        variables: data,
        onCompleted: () => {
          toast({
            title: 'Success!',
            variant: 'success',
            description: 'Unit created successfully',
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
        <Can action="unitsManage">
          <Sheet.Trigger asChild>
            {trigger ?? (
              <Button>
                <IconPlus /> Create Unit <Kbd>C</Kbd>
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
                <IconUsersGroup size={16} />
                Create unit
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <UnitForm />
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
