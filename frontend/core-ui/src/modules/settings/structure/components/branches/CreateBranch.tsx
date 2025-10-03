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
import { ApolloError } from '@apollo/client';

export const CreateBranch = () => {
  const {
    methods,
    methods: { handleSubmit },
  } = useBranchForm();
  const [open, setOpen] = useState<boolean>(false);
  const { handleAdd, loading } = useBranchAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(BranchHotKeyScope.BranchAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(BranchHotKeyScope.BranchSettingsPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), BranchHotKeyScope.BranchSettingsPage);
  useScopedHotkeys(`esc`, () => onClose(), BranchHotKeyScope.BranchAddSheet);

  const submitHandler: SubmitHandler<TBranchForm> = React.useCallback(
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
          <IconPlus /> Create Branch
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
