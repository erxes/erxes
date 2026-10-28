import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import {
  Button,
  Form,
  Kbd,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
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
import { useTranslation } from 'react-i18next';

export const CreateClientPortalSheet = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
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
            title: t('success-exclamation'),
            variant: 'success',
            description: t('client-portal-created'),
          });
          navigate(`${data.clientPortalAdd._id}`);
        },
      });
    },
    [clientPortalAdd, reset, onClose, navigate],
  );

  return (
    <CoreModulePanel
      requiredPermission="clientPortalManage"
      name={'client-portal/ClientPortalAddSheet'}
      open={_open}
      onOpenChange={(open) => (open ? onOpen() : onClose())}
    >
      <Can action="clientPortalManage">
        <CoreModulePanel.Trigger asChild>
          <Button>
            <IconPlus />
            {t('create-client-portal')}
            <Kbd>C</Kbd>
          </Button>
        </CoreModulePanel.Trigger>
      </Can>
      <CoreModulePanel.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <CoreModulePanel.Header>
              <IconChessKnight />
              <CoreModulePanel.Title>
                {t('create-client-portal')}
              </CoreModulePanel.Title>
              <CoreModulePanel.Close />
            </CoreModulePanel.Header>
            <CoreModulePanel.Content className="grow size-full flex flex-col px-5 py-4">
              <ClientPortalCreateForm />
            </CoreModulePanel.Content>
            <CoreModulePanel.Footer>
              <Button
                variant={'secondary'}
                onClick={onClose}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
              <Button type="submit">
                {loading ? <Spinner /> : t('create')}
              </Button>
            </CoreModulePanel.Footer>
          </form>
        </Form>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
