import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { Button, Form, Spinner, useToast } from 'erxes-ui';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import { useUnitDetailsById } from '@/settings/structure/hooks/useUnitDetailsById';
import { useUnitEdit } from '@/settings/structure/hooks/useUnitActions';
import { useUnitForm } from '@/settings/structure/hooks/useUnitForm';
import { TUnitForm } from '@/settings/structure/types/unit';
import { IconUsersGroup } from '@tabler/icons-react';
import { UnitForm } from '../UnitForm';
import { Can } from 'ui-modules';

export const UnitEdit = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [searchParams, setSearchParams] = useSearchParams();

  const id = searchParams.get('unit_id');

  const { unitDetail, loading } = useUnitDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = useUnitEdit();

  const {
    methods,
    methods: { reset, handleSubmit },
  } = useUnitForm();
  const { toast } = useToast();

  const setOpen = (newUnitId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newUnitId) {
      newSearchParams.set('unit_id', newUnitId);
    } else {
      newSearchParams.delete('unit_id');
    }
    setSearchParams(newSearchParams);
  };
  const submitHandler: SubmitHandler<TUnitForm> = (data) => {
    handleEdit({
      variables: {
        ...data,
        id,
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          variant: 'success',
          description: t('unit-updated'),
        });
        methods.reset();
        setOpen(null);
      },
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  useEffect(() => {
    if (unitDetail) {
      const { __typename, _id, ...rest } = unitDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [unitDetail, reset]);

  return (
    <CoreModulePanel
      name={'settings/structure/units/UnitEdit'}
      open={!!id}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
        }
      }}
    >
      <CoreModulePanel.View className="p-0">
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <CoreModulePanel.Header>
              <CoreModulePanel.Title className="text-lg text-foreground flex items-center gap-1">
                <IconUsersGroup size={16} />
                {unitDetail?.title || ''}
              </CoreModulePanel.Title>
              <CoreModulePanel.Close />
            </CoreModulePanel.Header>
            <CoreModulePanel.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <UnitForm loading={loading} />
            </CoreModulePanel.Content>
            <CoreModulePanel.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(null)}>
                {t('cancel')}
              </Button>
              <Can action="unitsManage">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : t('save')}
                </Button>
              </Can>
            </CoreModulePanel.Footer>
          </form>
        </Form>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
