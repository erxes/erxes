import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { IconChessKnight, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Kbd,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
  useQueryState,
} from 'erxes-ui';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBrandsForm } from '@/settings/brands/hooks/useBrandsForm';
import { useBrandsAdd } from '@/settings/brands/hooks/useBrandsAdd';
import { SubmitHandler } from 'react-hook-form';
import { BrandsForm } from '@/settings/brands/components/BrandsForm';
import { BrandsHotKeyScope, TBrandsForm } from '@/settings/brands/types';
import { useTranslation } from 'react-i18next';

export const CreateBrand = () => {
  const { toast } = useToast();
  const { brandsAdd, loading } = useBrandsAdd();
  const { t } = useTranslation('settings', {
    keyPrefix: 'brands',
  });
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useBrandsForm();

  const [_open, _setOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [createParam] = useQueryState('create_brand');

  const open = _open || !!createParam;

  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    _setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(BrandsHotKeyScope.BrandsCreateSheet);
  };

  const onClose = () => {
    setHotkeyScope(BrandsHotKeyScope.BrandsSettingsPage);
    _setOpen(false);
    if (createParam) {
      const next = new URLSearchParams(searchParams);
      next.delete('create_brand');
      setSearchParams(next);
    }
  };

  useEffect(() => {
    if (createParam) {
      setHotkeyScopeAndMemorizePreviousScope(
        BrandsHotKeyScope.BrandsCreateSheet,
      );
    }
  }, [createParam, setHotkeyScopeAndMemorizePreviousScope]);

  useScopedHotkeys(`c`, () => onOpen(), BrandsHotKeyScope.BrandsSettingsPage);
  useScopedHotkeys(`esc`, () => onClose(), BrandsHotKeyScope.BrandsCreateSheet);

  const submitHandler: SubmitHandler<TBrandsForm> = React.useCallback(
    async (data) => {
      brandsAdd({
        variables: data,
        onCompleted: () => {
          toast({
            variant: 'success',
            title: t('brand-created-successfully'),
          });
          reset();
          onClose();
        },
        onError: (error) =>
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [brandsAdd, toast, reset, onClose, t],
  );

  return (
    <CoreModulePanel
      name={'settings/brands/CreateBrand'}
      open={open}
      onOpenChange={(open) => (open ? onOpen() : onClose())}
    >
      <CoreModulePanel.Trigger asChild>
        <Button>
          <IconPlus />
          {t('create-brand')}
          <Kbd>C</Kbd>
        </Button>
      </CoreModulePanel.Trigger>
      <CoreModulePanel.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <CoreModulePanel.Header>
              <IconChessKnight />
              <CoreModulePanel.Title>{t('create-brand')}</CoreModulePanel.Title>
              <CoreModulePanel.Close />
            </CoreModulePanel.Header>
            <CoreModulePanel.Content className="grow size-full flex flex-col px-5 py-4">
              <BrandsForm />
            </CoreModulePanel.Content>
            <CoreModulePanel.Footer>
              <Button variant={'secondary'} onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('create-brand')}
              </Button>
            </CoreModulePanel.Footer>
          </form>
        </Form>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
