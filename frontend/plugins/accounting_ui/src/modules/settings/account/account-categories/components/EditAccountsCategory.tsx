import {
  Sheet,
  ScrollArea,
  isDeeplyEqual,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useAccountCategoryDetail } from '../hooks/useAccountCategoryDetail';
import { TAccountCategoryForm } from '../types/AccountCategory';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountCategorySchema } from '../constants/accountCategorySchema';
import { ACCOUNT_CATEGORY_DEFAULT_VALUES } from '../constants/accountCategoryDefaultValues';
import { useEffect } from 'react';
import { useAccountCategoryEdit } from '../hooks/useAccountCategoryEdit';
import { AccountCategoryForm } from './AccountCategoryForm';

export const EditAccountCategory = () => {
  const [open, setOpen] = useQueryState<string>('accountCategoryId');
  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>Edit Account Category</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Edit Account Category Details
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <EditAccountCategoryForm onClose={() => setOpen(null)} />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const EditAccountCategoryForm = ({
  onClose,
}: {
  onClose?: () => void;
}) => {
  const { accountCategoryDetail, closeDetail, loading } =
    useAccountCategoryDetail();
  const { editAccountCategory, loading: editLoading } =
    useAccountCategoryEdit();
  const form = useForm<TAccountCategoryForm>({
    resolver: zodResolver(accountCategorySchema),
    defaultValues: ACCOUNT_CATEGORY_DEFAULT_VALUES,
  });
  const { reset } = form;

  useEffect(() => {
    if (accountCategoryDetail) {
      reset(accountCategoryDetail);
    }
  }, [accountCategoryDetail, reset]);

  const handleSubmit = (data: TAccountCategoryForm) => {
    const initialData = {
      ...ACCOUNT_CATEGORY_DEFAULT_VALUES,
      ...accountCategoryDetail,
    };
    const newData = { ...initialData, ...data };

    if (isDeeplyEqual(newData, initialData)) {
      reset();
      return closeDetail();
    }
    editAccountCategory({
      variables: {
        _id: accountCategoryDetail?._id,
        ...data,
      },
      onCompleted: () => {
        closeDetail();
        reset();
      },
    });
  };

  return (
    <>
      <AccountCategoryForm
        form={form}
        handleSubmit={handleSubmit}
        loading={editLoading}
        onClose={onClose || closeDetail}
      />
      {loading && (
        <div className="absolute inset-0 bg-background/10 backdrop-blur-xs flex items-center justify-center rounded-md">
          <Spinner />
        </div>
      )}
    </>
  );
};
