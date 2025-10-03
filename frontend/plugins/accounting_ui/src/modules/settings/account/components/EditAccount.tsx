import { Dialog, isDeeplyEqual, Spinner, useQueryState } from 'erxes-ui';
import { AccountForm } from './AccountForm';
import { AccountingDialog } from '@/layout/components/Dialog';
import { TAccountForm } from '../types/accountForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema } from '../constants/accountSchema';
import { useAccountDetail } from '../hooks/useAccountDetail';
import { useEffect } from 'react';
import { useAccountEdit } from '../hooks/useAccountEdit';
import { ACCOUNT_DEFAULT_VALUES } from '../constants/accountDefaultValues';

export const EditAccount = () => {
  const [open, setOpen] = useQueryState<string>('accountId');
  return (
    <Dialog open={open !== null} onOpenChange={() => setOpen(null)}>
      <AccountingDialog title="Edit Account" description="Edit an account">
        <EditAccountForm />
      </AccountingDialog>
    </Dialog>
  );
};

export const EditAccountForm = () => {
  const { accountDetail, closeDetail, loading } = useAccountDetail();
  const { editAccount, loading: editLoading } = useAccountEdit();

  const form = useForm<TAccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: ACCOUNT_DEFAULT_VALUES,
  });
  const { reset } = form;

  useEffect(() => {
    if (accountDetail) {
      reset(accountDetail);
    }
  }, [accountDetail, reset]);

  const handleSubmit = (data: TAccountForm) => {
    const initialData = { ...ACCOUNT_DEFAULT_VALUES, ...accountDetail };
    const newData = { ...initialData, ...data };

    if (isDeeplyEqual(newData, initialData)) {
      reset();
      return closeDetail();
    }
    editAccount(
      {
        variables: {
          _id: accountDetail?._id,
          ...data,
        },
        onCompleted: () => {
          closeDetail();
          reset();
        },
      },
      Object.keys(data),
    );
  };

  return (
    <>
      <AccountForm
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
