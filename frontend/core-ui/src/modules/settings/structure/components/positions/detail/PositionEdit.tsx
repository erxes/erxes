import { Button, Form, Sheet, Spinner, useToast } from 'erxes-ui';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import { IconBriefcase } from '@tabler/icons-react';
import { usePositionDetailsById } from '@/settings/structure/hooks/usePositionDetailsById';
import { usePositionEdit } from '@/settings/structure/hooks/usePositionActions';
import { usePositionForm } from '@/settings/structure/hooks/usePositionForm';
import { TPositionForm } from '@/settings/structure/types/position';
import { PositionForm } from '../PositionForm';

export const PositionEdit = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const id = searchParams.get('position_id');

  const { positionDetail, loading } = usePositionDetailsById({
    variables: {
      id,
    },
  });

  const { handleEdit, loading: isLoading } = usePositionEdit();

  const {
    methods,
    methods: { reset, handleSubmit },
  } = usePositionForm();
  const { toast } = useToast();

  const setOpen = (newPositionId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newPositionId) {
      newSearchParams.set('position_id', newPositionId);
    } else {
      newSearchParams.delete('position_id');
    }
    setSearchParams(newSearchParams);
  };
  const submitHandler: SubmitHandler<TPositionForm> = React.useCallback(
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
    if (positionDetail) {
      const { __typename, _id, ...rest } = positionDetail;
      reset(rest);
    }
  }, [positionDetail]);

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
                <IconBriefcase size={16} />
                {positionDetail?.title || ''}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <PositionForm loading={loading} />
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
