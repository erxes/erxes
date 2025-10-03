import { Dialog, isDeeplyEqual, Spinner, useQueryState } from 'erxes-ui';
import { useVatRowDetail } from '../hooks/useVatRowDetail';
import { TVatRowForm } from '../types/VatRow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vatFormSchema } from '../constants/vatFormSchema';
import { useEffect } from 'react';
import { useVatRowEdit } from '../hooks/useVatRowEdit';
import { VatRowForm } from './VatRowForm';
import { AccountingDialog } from '@/layout/components/Dialog';

export const EditVatRow = () => {
  const [open, setOpen] = useQueryState<string>('vat_row_id');
  return (
    <Dialog open={open !== null} onOpenChange={() => setOpen(null)}>
      <AccountingDialog
        title="Edit Vat Row"
        description="Edit an vat row"
      >
        <EditVatRowForm />
      </AccountingDialog>
    </Dialog>
  );
};

export const EditVatRowForm = () => {
  const { vatRowDetail, closeDetail, loading } =
    useVatRowDetail();
  const { editVatRow, loading: editLoading } =
    useVatRowEdit();
  const form = useForm<TVatRowForm>({
    resolver: zodResolver(vatFormSchema),
  });
  const { reset } = form;

  useEffect(() => {
    if (vatRowDetail) {
      reset(vatRowDetail);
    }
  }, [vatRowDetail, reset]);

  const handleSubmit = (data: TVatRowForm) => {
    const initialData = {
      ...vatRowDetail,
    };
    const newData = { ...initialData, ...data };

    if (isDeeplyEqual(newData, initialData)) {
      reset();
      return closeDetail();
    }
    editVatRow({
      variables: {
        _id: vatRowDetail?._id,
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
      <VatRowForm
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
