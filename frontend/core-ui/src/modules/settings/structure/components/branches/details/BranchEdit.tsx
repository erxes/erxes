import { useBranchDetailsById } from '@/settings/structure/hooks/useBranchDetailsById';
import { useBranchForm } from '@/settings/structure/hooks/useBranchForm';
import { IconGitBranch } from '@tabler/icons-react';
import { Button, Form, Sheet, Spinner, useToast } from 'erxes-ui';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BranchForm } from '../BranchForm';
import { SubmitHandler } from 'react-hook-form';
import { TBranchForm } from '@/settings/structure/types/branch';
import { useBranchEdit } from '@/settings/structure/hooks/useBranchActions';

export const BranchEdit = ({ children }: { children?: React.ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const id = searchParams.get('branch_id');

  const { branchDetail, loading } = useBranchDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = useBranchEdit();

  const {
    methods,
    methods: { reset, handleSubmit },
  } = useBranchForm();
  const { toast } = useToast();

  const setOpen = (newBranchId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newBranchId) {
      newSearchParams.set('branch_id', newBranchId);
    } else {
      newSearchParams.delete('branch_id');
    }
    setSearchParams(newSearchParams);
  };
  const submitHandler: SubmitHandler<TBranchForm> = React.useCallback(
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
    if (branchDetail) {
      const { __typename, _id, ...rest } = branchDetail;
      reset(rest);
    }
  }, [branchDetail]);

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
                <IconGitBranch size={16} />
                {branchDetail?.title || ''}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <BranchForm />
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
