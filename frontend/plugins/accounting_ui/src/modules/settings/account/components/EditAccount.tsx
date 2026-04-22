import {
  Sheet,
  ScrollArea,
  isDeeplyEqual,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { AccountForm } from './AccountForm';
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
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>Edit Account</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Edit Account Details
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <EditAccountForm onClose={() => setOpen(null)} />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const EditAccountForm = ({ onClose }: { onClose?: () => void }) => {
  const { accountDetail, closeDetail, loading } = useAccountDetail();
  const { editAccount, loading: editLoading } = useAccountEdit();

  const form = useForm<TAccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: accountDetail || ACCOUNT_DEFAULT_VALUES,
  });
  const { reset } = form;

  useEffect(() => {
    if (accountDetail) {
      reset({
        ...ACCOUNT_DEFAULT_VALUES,
        ...accountDetail,
      });
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
