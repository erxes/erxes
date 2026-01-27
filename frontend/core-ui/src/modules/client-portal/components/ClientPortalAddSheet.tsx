import { ClientPortalCreateForm } from '@/client-portal/components/ClientPortalCreateForm';
import { TClientPortalAddForm, useClientPortalForm } from '@/client-portal/hooks/useClientPortalForm';
import { useCreateClientPortal } from '@/client-portal/hooks/useCreateClientPortal';
import { ClientPortalHotKeyScope } from '@/client-portal/types/clientPortal';
import { IconChessKnight, IconPlus } from '@tabler/icons-react';
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

import { useNavigate } from 'react-router-dom';

export const CreateClientPortalSheet = () => {
  const { toast } = useToast();
  const { clientPortalAdd, loading } = useCreateClientPortal();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useClientPortalForm();

  const navigate = useNavigate();
  const [_open, _setOpen] = useState<boolean>(false);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    _setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      ClientPortalHotKeyScope.ClientPortalAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(ClientPortalHotKeyScope.ClientPortalSettingsPage);
    _setOpen(false);
  };

  useScopedHotkeys(
    `c`,
    () => onOpen(),
    ClientPortalHotKeyScope.ClientPortalSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    ClientPortalHotKeyScope.ClientPortalAddSheet,
  );

  const submitHandler: SubmitHandler<TClientPortalAddForm> = React.useCallback(
    async (data) => {
      clientPortalAdd({
        variables: data,
        onCompleted: (data) => {
          console.log(data);
          toast({
            title: 'Success!',
            variant: 'success',
            description: 'Client portal created successfully',
          });
          navigate(`${data.clientPortalAdd._id}`);
        },
      });
    },
    [clientPortalAdd, reset, onClose, navigate],
  );

  return (
    <Sheet open={_open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Create client portal
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <Sheet.Header>
              <IconChessKnight />
              <Sheet.Title>Create client portal</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <ClientPortalCreateForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                variant={'secondary'}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit">{loading ? <Spinner /> : 'Create'}</Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
