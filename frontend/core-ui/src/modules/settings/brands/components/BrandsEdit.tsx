import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { IconChessKnight } from '@tabler/icons-react';
import { Button, Form, Spinner, useQueryState, useToast } from 'erxes-ui';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBrandsForm } from '@/settings/brands/hooks/useBrandsForm';
import { SubmitHandler } from 'react-hook-form';
import { BrandsForm } from '@/settings/brands/components/BrandsForm';
import { useBrandsEdit } from '@/settings/brands/hooks/useBrandsEdit';
import { TBrandsForm } from '@/settings/brands/types';
import { ApolloError } from '@apollo/client';
import { useBrandById } from '@/settings/brands/hooks/useBrandById';

export const BrandsEdit = () => {
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useBrandsForm();
  const { handleEdit, loading: isLoading } = useBrandsEdit();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'brands' });

  const [searchParams, setSearchParams] = useSearchParams();
  const [brandId] = useQueryState('brand_id');
  const { brand } = useBrandById({
    variables: { id: brandId || '' },
  });

  const setOpen = (newBrandId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newBrandId) {
      newSearchParams.set('brand_id', newBrandId);
    } else {
      newSearchParams.delete('brand_id');
    }
    setSearchParams(newSearchParams);
  };
  const submitHandler: SubmitHandler<TBrandsForm> = React.useCallback(
    async (data) => {
      handleEdit(
        {
          variables: {
            id: brandId,
            ...data,
          },
          onCompleted: () => {
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
    },
    [handleEdit, methods, toast, brandId, setOpen, t],
  );

  React.useEffect(() => {
    if (brand) {
      methods.reset({
        name: brand.name,
        description: brand.description,
      });
    }
  }, [brand, methods]);

  return (
    <CoreModulePanel
      name={'settings/brands/BrandsEdit'}
      open={!!brandId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
          setOpen(null);
        }
      }}
    >
      <CoreModulePanel.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <CoreModulePanel.Header>
              <IconChessKnight />
              <CoreModulePanel.Title>{t('edit-brand')}</CoreModulePanel.Title>
              <CoreModulePanel.Close />
            </CoreModulePanel.Header>
            <CoreModulePanel.Content className="grow size-full flex flex-col px-5 py-4">
              <BrandsForm />
            </CoreModulePanel.Content>
            <CoreModulePanel.Footer>
              <Button
                variant={'secondary'}
                onClick={() => {
                  reset();
                  setOpen(null);
                }}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : t('update')}
              </Button>
            </CoreModulePanel.Footer>
          </form>
        </Form>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
