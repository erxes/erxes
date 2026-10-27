import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { IconPlus, IconUsersGroup } from '@tabler/icons-react';
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
import { useUnitForm } from '../../hooks/useUnitForm';
import { useUnitAdd } from '../../hooks/useUnitActions';
import { TUnitForm, UnitHotKeyScope } from '../../types/unit';
import { UnitForm } from './UnitForm';
import { Can, usePermissionCheck } from 'ui-modules';

export const CreateUnit = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const {
    methods,
    methods: { handleSubmit },
  } = useUnitForm();
  const [open, setOpen] = useState<boolean>(false);
  const { handleAdd, loading } = useUnitAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageUnits = isLoaded && hasActionPermission('unitsManage');

  const onOpen = () => {
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
      onOpen();
    },
    UnitHotKeyScope.UnitSettingsPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), UnitHotKeyScope.UnitAddSheet);

  const submitHandler: SubmitHandler<TUnitForm> = React.useCallback(
    async (data) => {
      handleAdd({
        variables: data,
        onCompleted: () => {
          toast({
            title: t('success'),
            variant: 'success',
            description: t('unit-created'),
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
      requiredPermission="unitsManage"
      name={'settings/structure/units/CreateUnit'}
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
    >
      <Can action="unitsManage">
        <CoreModulePanel.Trigger asChild>
          <Button>
            <IconPlus /> {t('create-unit')}
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
                <IconUsersGroup size={16} />
                {t('create-unit-title')}
              </CoreModulePanel.Title>
              <CoreModulePanel.Close />
            </CoreModulePanel.Header>
            <CoreModulePanel.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <UnitForm />
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
