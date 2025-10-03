import { IconFolder } from '@tabler/icons-react';
import { Button, Form, Sheet, Spinner, useToast } from 'erxes-ui';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { useDepartmentEdit } from '@/settings/structure/hooks/useDepartmentActions';
import { useDepartmentForm } from '@/settings/structure/hooks/useDepartmentForm';
import { TDepartmentForm } from '@/settings/structure/types/department';
import { DepartmentForm } from '../DepartmentForm';

export const DepartmentEdit = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const id = searchParams.get('department_id');

  const { departmentDetail, loading } = useDepartmentDetailsById({
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
  const submitHandler: SubmitHandler<TDepartmentForm> = React.useCallback(
    async (data) => {
      handleEdit({
        variables: {
          id,
          ...data,
        },
        onCompleted: () => {
          toast({ title: 'Success!' });
          methods.reset();
          setOpen(null);
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [handleEdit],
  );

  useEffect(() => {
    if (departmentDetail) {
      const { __typename, _id, ...rest } = departmentDetail;
      reset(rest);
    }
  }, [departmentDetail]);

  return (
    <Sheet
      open={!!id}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
        }
      }}
    >
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <Sheet.Header>
              <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                <IconFolder size={16} />
                {departmentDetail?.title || ''}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <DepartmentForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
