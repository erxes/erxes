import { Button, Form, Sheet, Spinner, useToast } from 'erxes-ui';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import { useUnitDetailsById } from '@/settings/structure/hooks/useUnitDetailsById';
import { useUnitEdit } from '@/settings/structure/hooks/useUnitActions';
import { useUnitForm } from '@/settings/structure/hooks/useUnitForm';
import { TUnitForm } from '@/settings/structure/types/unit';
import { IconUsersGroup } from '@tabler/icons-react';
import { UnitForm } from '../UnitForm';

export const UnitEdit = () => {
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
  const submitHandler: SubmitHandler<TUnitForm> = React.useCallback(
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
    if (unitDetail) {
      const { __typename, _id, ...rest } = unitDetail;
      reset(rest);
    }
  }, [unitDetail]);

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
                <IconUsersGroup size={16} />
                {unitDetail?.title || ''}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <UnitForm loading={loading} />
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
