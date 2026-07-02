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
import { useTranslation } from 'react-i18next';
import { IconChessKnight, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import {
  TClientPortalAddForm,
  useClientPortalForm,
} from '@/client-portal/hooks/useClientPortalForm';

import { ClientPortalCreateForm } from '@/client-portal/components/ClientPortalCreateForm';
import { ClientPortalHotKeyScope } from '@/client-portal/types/clientPortal';
import { SubmitHandler } from 'react-hook-form';
import { useCreateClientPortal } from '@/client-portal/hooks/useCreateClientPortal';
import { useNavigate } from 'react-router-dom';
import { Can, usePermissionCheck } from 'ui-modules';

export const CreateClientPortalSheet = () => {
  const { t } = useTranslation('client-portal');
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
  const { hasActionPermission } = usePermissionCheck();
  const canManageClientPortal = hasActionPermission('clientPortalManage');

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageClientPortal) return;
      onOpen();
    },
    ClientPortalHotKeyScope.ClientPortalSettingsPage,
    [canManageClientPortal],
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
          toast({
            title: t('success', 'Success!'),
            variant: 'success',
            description: t('client-portal-created-successfully', 'Client portal created successfully'),
          });
          navigate(`${data.clientPortalAdd._id}`);
        },
      });
    },
    [clientPortalAdd, reset, onClose, navigate],
  );

  return (
    <Sheet open={_open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Can action="clientPortalManage">
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            {t('create-client-portal', 'Create client portal')}
            <Kbd>C</Kbd>
          </Button>
        </Sheet.Trigger>
      </Can>
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <Sheet.Header>
              <IconChessKnight />
              <Sheet.Title>{t('create-client-portal', 'Create client portal')}</Sheet.Title>
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
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit">{loading ? <Spinner /> : t('create', 'Create')}</Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
