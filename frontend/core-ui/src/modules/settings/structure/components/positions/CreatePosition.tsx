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
import { Can, usePermissionCheck } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const CreatePosition = () => {
  const { t } = useTranslation('settings');
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
            title: t('success', 'Success!'),
            variant: 'success',
            description: t('position.created-successfully', 'Position created successfully'),
          });
          methods.reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: t('error', 'Error'),
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [handleAdd],
  );
  return (
    <Sheet onOpenChange={(open) => (open ? onOpen() : onClose())} open={open}>
      <Can action="positionsManage">
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus /> {t('position.create', 'Create Position')}
            <Kbd>C</Kbd>
          </Button>
        </Sheet.Trigger>
      </Can>
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
                {t('position.create-title', 'Create position')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <PositionForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('create', 'Create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
