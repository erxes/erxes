import { Dialog, isDeeplyEqual, Spinner, useQueryState } from 'erxes-ui';
import { useCtaxRowDetail } from '../hooks/useCtaxRowDetail';
import { TCtaxRowForm } from '../types/CtaxRow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';
import { useEffect } from 'react';
import { useCtaxRowEdit } from '../hooks/useCtaxRowEdit';
import { CtaxRowForm } from './CtaxRowForm';
import { AccountingDialog } from '@/layout/components/Dialog';

export const EditCtaxRow = () => {
  const [open, setOpen] = useQueryState<string>('ctax_row_id');
  return (
    <Dialog open={open !== null} onOpenChange={() => setOpen(null)}>
      <AccountingDialog
        title="Edit Ctax Row"
        description="Edit an ctax row"
      >
        <EditCtaxRowForm />
      </AccountingDialog>
    </Dialog>
  );
};

export const EditCtaxRowForm = () => {
  const { ctaxRowDetail, closeDetail, loading } =
    useCtaxRowDetail();
  const { editCtaxRow, loading: editLoading } =
    useCtaxRowEdit();
  const form = useForm<TCtaxRowForm>({
    resolver: zodResolver(ctaxFormSchema),
  });
  const { reset } = form;

  useEffect(() => {
    if (ctaxRowDetail) {
      reset(ctaxRowDetail);
    }
  }, [ctaxRowDetail, reset]);

  const handleSubmit = (data: TCtaxRowForm) => {
    const initialData = {
      ...ctaxRowDetail,
    };
    const newData = { ...initialData, ...data };

    if (isDeeplyEqual(newData, initialData)) {
      reset();
      return closeDetail();
    }
    editCtaxRow({
      variables: {
        _id: ctaxRowDetail?._id,
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
      <CtaxRowForm
        form={form}
        onSubmit={handleSubmit}
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
