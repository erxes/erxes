import { Dialog, isDeeplyEqual, Spinner, useQueryState } from 'erxes-ui';
import { AccountingDialog } from '@/layout/components/Dialog';
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
    <Dialog open={open !== null} onOpenChange={() => setOpen(null)}>
      <AccountingDialog
        title="Edit Account Category"
        description="Edit an account category"
      >
        <EditAccountCategoryForm />
      </AccountingDialog>
    </Dialog>
  );
};

export const EditAccountCategoryForm = () => {
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
      />
      {loading && (
        <div className="absolute inset-0 bg-background/10 backdrop-blur-sm flex items-center justify-center rounded-md">
          <Spinner />
        </div>
      )}
    </>
  );
};
