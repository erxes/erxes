import { IconBriefcase, IconPlus } from '@tabler/icons-react';
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
import { usePositionForm } from '../../hooks/usePositionForm';
import { usePositionAdd } from '../../hooks/usePositionActions';
import { PositionHotKeyScope, TPositionForm } from '../../types/position';
import { PositionForm } from './PositionForm';

export const CreatePosition = () => {
  const {
    methods,
    methods: { handleSubmit },
  } = usePositionForm();
  const [open, setOpen] = useState<boolean>(false);
  const { handleAdd, loading } = usePositionAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      PositionHotKeyScope.PositionAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(PositionHotKeyScope.PositionSettingsPage);
    setOpen(false);
  };

  useScopedHotkeys(
    `c`,
    () => onOpen(),
    PositionHotKeyScope.PositionSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    PositionHotKeyScope.PositionAddSheet,
  );

  const submitHandler: SubmitHandler<TPositionForm> = React.useCallback(
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
          <IconPlus /> Create Position
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
                <IconBriefcase size={16} />
                Create position
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <PositionForm />
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
