import { IconChessKnight } from '@tabler/icons-react';
import {
  Button,
  Form,
  Sheet,
  Spinner,
  useQueryState,
  useToast,
} from 'erxes-ui';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBrandsForm } from '../hooks/useBrandsForm';
import { SubmitHandler } from 'react-hook-form';
import { BrandsForm } from './BrandsForm';
import { useBrandsEdit } from '../hooks/useBrandsEdit';
import { TBrandsForm } from '../types';
import { ApolloError } from '@apollo/client';
import { useBrandById } from '@/settings/brands/hooks/useBrandById';

export const BrandsEdit = () => {
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useBrandsForm();
  const { handleEdit, loading: isLoading } = useBrandsEdit();
  const { toast } = useToast();

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
            toast({ title: 'Success!' });
            methods.reset();
            setOpen(null);
          },
          onError: (error: ApolloError) =>
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            }),
        },
        ['name', 'description'],
      );
    },
    [handleEdit, methods, toast, brandId, setOpen],
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
    <Sheet
      open={!!brandId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
          setOpen(null);
        }
      }}
    >
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <Sheet.Header>
              <IconChessKnight />
              <Sheet.Title>Edit brand</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <BrandsForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                variant={'secondary'}
                onClick={() => {
                  reset();
                  setOpen(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : 'Update'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
