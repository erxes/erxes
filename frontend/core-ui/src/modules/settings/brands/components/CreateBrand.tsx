import {
  TBrandsForm,
  BrandsHotKeyScope,
} from '../types';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
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
  cn,
} from 'erxes-ui';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBrandsForm } from '@/settings/brands/hooks/useBrandsForm';
import { useBrandsAdd } from '@/settings/brands/hooks/useBrandsAdd';
import { BrandsForm } from '@/settings/brands/components/BrandsForm';
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
  const [, setSearchParams] = useSearchParams();
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
      setSearchParams((currentParams) => {
        const next = new URLSearchParams(currentParams);
        next.delete('create_brand');
        return next;
      });
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
          if (!pagePanel.isCurrent()) return;
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
  const pagePanel = usePagePanel({
    name: 'settings/brands/CreateBrand',
    open: open,
    onOpenChange: (open) => (open ? onOpen() : onClose()),
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <Button onClick={pagePanel.onOpen}>
          <IconPlus />
          {t('create-brand')}
          <Kbd>C</Kbd>
        </Button>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <Form {...methods}>
                      <form
                        className="flex flex-col gap-0 size-full"
                        onSubmit={handleSubmit(submitHandler)}
                      >
                        <RecordSidePanel.Header
                          title={<>{t('create-brand')}</>}
                          onBack={pagePanel.onBack}
                          onClose={pagePanel.onClose}
                          expanded={pagePanel.expanded}
                          onExpand={pagePanel.onExpand}
                          avatar={<IconChessKnight />}
                        />
                        <div
                          className={cn(
                            'flex min-h-0 flex-1 flex-col overflow-y-auto',
                            'grow size-full flex flex-col px-5 py-4',
                          )}
                        >
                          <BrandsForm />
                        </div>
                        <div
                          className={cn(
                            'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
                          )}
                        >
                          <Button variant={'secondary'} onClick={onClose}>
                            {t('cancel')}
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t('create-brand')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </>
                ) : (
                  <PagePanelStatus entry={pagePanel} />
                )}
              </div>,
              pagePanel.target,
            )
          : null}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
