import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { IconFolder } from '@tabler/icons-react';
import { Button, Form, Spinner, useToast } from 'erxes-ui';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { useDepartmentEdit } from '@/settings/structure/hooks/useDepartmentActions';
import { useDepartmentForm } from '@/settings/structure/hooks/useDepartmentForm';
import { TDepartmentForm } from '@/settings/structure/types/department';
import { DepartmentForm } from '@/settings/structure/components/departments/DepartmentForm';
import { Can } from 'ui-modules';

export const DepartmentEdit = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [searchParams, setSearchParams] = useSearchParams();

  const id = searchParams.get('department_id');

  const { departmentDetail } = useDepartmentDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = useDepartmentEdit();

  const {
    methods,
    methods: { reset, handleSubmit },
  } = useDepartmentForm();
  const { toast } = useToast();

  const setOpen = (newDepartmentId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newDepartmentId) {
      newSearchParams.set('department_id', newDepartmentId);
    } else {
      newSearchParams.delete('department_id');
    }
    setSearchParams(newSearchParams);
  };
  const submitHandler: SubmitHandler<TDepartmentForm> = (data) => {
    handleEdit({
      variables: {
        ...data,
        id,
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          variant: 'success',
          description: t('department-updated'),
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
    if (departmentDetail) {
      const { __typename, _id, ...rest } = departmentDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [departmentDetail, reset]);

  return (
    <CoreModulePanel
      name={'settings/structure/departments/DepartmentEdit'}
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
                <IconFolder size={16} />
                {departmentDetail?.title || ''}
              </CoreModulePanel.Title>
              <CoreModulePanel.Close />
            </CoreModulePanel.Header>
            <CoreModulePanel.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <DepartmentForm />
            </CoreModulePanel.Content>
            <CoreModulePanel.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(null)}>
                {t('cancel')}
              </Button>
              <Can action="departmentsManage">
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
