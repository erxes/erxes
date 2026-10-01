import { IconGitBranch, IconPlus } from '@tabler/icons-react';
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
import { BranchHotKeyScope, TBranchForm } from '../../types/branch';
import { BranchForm } from './BranchForm';
import { useBranchForm } from '../../hooks/useBranchForm';
import { SubmitHandler } from 'react-hook-form';
import { useBranchAdd } from '../../hooks/useBranchActions';
import { Can, usePermissionCheck } from 'ui-modules';

export const CreateBranch = ({
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
  } = useBranchForm();
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
  const { handleAdd, loading } = useBranchAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageBranches = isLoaded && hasActionPermission('branchesManage');

  const onOpen = () => {
    if (defaultParentId) {
      methods.setValue('parentId', defaultParentId);
    }
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(BranchHotKeyScope.BranchAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(BranchHotKeyScope.BranchSettingsPage);
    setOpen(false);
  };

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageBranches) return;
      if (trigger || isControlled) return;
      onOpen();
    },
    BranchHotKeyScope.BranchSettingsPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), BranchHotKeyScope.BranchAddSheet);

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
        setHotkeyScopeAndMemorizePreviousScope(BranchHotKeyScope.BranchAddSheet);
      } else {
        setHotkeyScope(BranchHotKeyScope.BranchSettingsPage);
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

  const submitHandler: SubmitHandler<TBranchForm> = React.useCallback(
    async (data) => {
      handleAdd({
        variables: data,
        onCompleted: () => {
          toast({
            title: 'Success!',
            variant: 'success',
            description: 'Branch created successfully',
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
        <Can action="branchesManage">
          <Sheet.Trigger asChild>
            {trigger ?? (
              <Button>
                <IconPlus /> Create Branch <Kbd>C</Kbd>
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
                <IconGitBranch size={16} />
                Create branch
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <BranchForm />
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
