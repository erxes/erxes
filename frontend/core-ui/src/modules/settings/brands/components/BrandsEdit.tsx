import { ApolloError } from '@apollo/client';
import { TBrandsForm } from '../types';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { PanelFormLayout, RecordSidePanel } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconChessKnight } from '@tabler/icons-react';
import { Form, useQueryState, useToast } from 'erxes-ui';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBrandsForm } from '@/settings/brands/hooks/useBrandsForm';
import { BrandsForm } from '@/settings/brands/components/BrandsForm';
import { useBrandsEdit } from '@/settings/brands/hooks/useBrandsEdit';
import { useBrandById } from '@/settings/brands/hooks/useBrandById';
export const BrandsEdit = () => {
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useBrandsForm();
  const { handleEdit, loading: isLoading } = useBrandsEdit();
  const { toast } = useToast();
  const { t } = useTranslation('settings', {
    keyPrefix: 'brands',
  });
  const [, setSearchParams] = useSearchParams();
  const [brandId] = useQueryState<string>('brand_id');
  const { brand } = useBrandById({
    variables: {
      id: brandId || '',
    },
  });
  const setOpen = (newBrandId: string | null) => {
    setSearchParams((currentParams) => {
      const newSearchParams = new URLSearchParams(currentParams);
      if (newBrandId) {
        newSearchParams.set('brand_id', newBrandId);
      } else {
        newSearchParams.delete('brand_id');
      }
      return newSearchParams;
    });
  };
  const submitHandler: SubmitHandler<TBrandsForm> = async (data) => {
    handleEdit(
      {
        variables: {
          id: brandId,
          ...data,
        },
        onCompleted: () => {
          if (!pagePanel.isCurrent()) return;
          toast({
            title: t('brand-updated-successfully'),
            variant: 'success',
          });
          methods.reset();
          setOpen(null);
        },
        onError: (error: ApolloError) =>
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          }),
      },
      ['name', 'description'],
    );
  };
  React.useEffect(() => {
    if (brand) {
      methods.reset({
        name: brand.name,
        description: brand.description,
      });
    }
  }, [brand, methods]);
  const pagePanel = usePagePanel({
    name: 'settings/brands/BrandsEdit',
    open: !!brandId,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        reset();
        setOpen(null);
      }
    },
    identity: brandId || 'new',
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <RecordSidePanel.Header
              title={<>{t('edit-brand')}</>}
              {...pagePanel.headerProps}
              avatar={<IconChessKnight />}
            />
            <PanelFormLayout
              onCancel={() => {
                reset();
                setOpen(null);
              }}
              saving={isLoading}
              saveLabel={t('update')}
            >
              <BrandsForm />
            </PanelFormLayout>
          </form>
        </Form>
      ) : (
        <PagePanelStatus entry={pagePanel} />
      )}
    </div>,
    pagePanel,
  );
};
