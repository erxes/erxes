import { Sheet, Spinner, isDeeplyEqual, useQueryState, toast } from 'erxes-ui';

import { ACCOUNT_DEFAULT_VALUES } from '../constants/accountDefaultValues';
import { AccountForm } from './AccountForm';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { TAccountForm } from '../types/accountForm';
import { accountSchema } from '../constants/accountSchema';
import { useAccountDetail } from '../hooks/useAccountDetail';
import { useAccountEdit } from '../hooks/useAccountEdit';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
      const parsed = accountSchema
        .innerType()
        .partial()
        .safeParse({
          ...ACCOUNT_DEFAULT_VALUES,
          ...accountDetail,
        });
      if (parsed.success) reset(parsed.data);
      else
        toast({
          title: 'Invalid account data',
          description: parsed.error.message,
          variant: 'destructive',
        });
    }
  }, [accountDetail, reset]);

  const handleSubmit = (data: TAccountForm) => {
    if (!accountDetail?._id) return;
    const initialData = { ...ACCOUNT_DEFAULT_VALUES, ...accountDetail };
    const newData = { ...initialData, ...data };

    if (isDeeplyEqual(newData, initialData)) {
      reset();
      return closeDetail();
    }
    editAccount(
      {
        variables: {
          _id: accountDetail._id,
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
        <div className="absolute inset-0 bg-background/10 backdrop-blur-xs flex items-center justify-center rounded-md">
          <Spinner />
        </div>
      )}
    </>
  );
};

export const EditAccount = () => {
  const [open, setOpen] = useQueryState<string>('accountId');
  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <AccountingSheet title="Данс засах">
        <EditAccountForm />
      </AccountingSheet>
    </Sheet>
  );
};
