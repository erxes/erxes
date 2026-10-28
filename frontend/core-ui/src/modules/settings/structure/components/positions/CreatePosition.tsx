import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { IconBriefcase, IconPlus } from '@tabler/icons-react';
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
import React, { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { usePositionForm } from '@/settings/structure/hooks/usePositionForm';
import { usePositionAdd } from '@/settings/structure/hooks/usePositionActions';
import {
  PositionHotKeyScope,
  TPositionForm,
} from '@/settings/structure/types/position';
import { PositionForm } from '@/settings/structure/components/positions/PositionForm';
import { Can, usePermissionCheck } from 'ui-modules';

export const CreatePosition = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const {
    methods,
    methods: { handleSubmit },
  } = usePositionForm();
  const [open, setOpen] = useState<boolean>(false);
  const { handleAdd, loading } = usePositionAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManagePositions = isLoaded && hasActionPermission('positionsManage');

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
    () => {
      if (!canManagePositions) return;
      onOpen();
    },
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
          toast({
            title: t('success'),
            variant: 'success',
            description: t('position-created'),
          });
          methods.reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [handleAdd],
  );
  return (
    <CoreModulePanel
      requiredPermission="positionsManage"
      name={'settings/structure/positions/CreatePosition'}
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
    >
      <Can action="positionsManage">
        <CoreModulePanel.Trigger asChild>
          <Button>
            <IconPlus /> {t('create-position')}
            <Kbd>C</Kbd>
          </Button>
        </CoreModulePanel.Trigger>
      </Can>
      <CoreModulePanel.View
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
            <CoreModulePanel.Header>
              <CoreModulePanel.Title className="text-lg text-foreground flex items-center gap-1">
                <IconBriefcase size={16} />
                {t('create-position-title')}
              </CoreModulePanel.Title>
              <CoreModulePanel.Close />
            </CoreModulePanel.Header>
            <CoreModulePanel.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <PositionForm />
            </CoreModulePanel.Content>
            <CoreModulePanel.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('create')}
              </Button>
            </CoreModulePanel.Footer>
          </form>
        </Form>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
