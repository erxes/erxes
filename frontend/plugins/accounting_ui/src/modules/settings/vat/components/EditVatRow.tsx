import { Sheet, Spinner, isDeeplyEqual, useQueryState } from 'erxes-ui';

import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { TVatRowForm } from '../types/VatRow';
import { VatRowForm } from './VatRowForm';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useVatRowDetail } from '../hooks/useVatRowDetail';
import { useVatRowEdit } from '../hooks/useVatRowEdit';
import { vatFormSchema } from '../constants/vatFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';

export const EditVatRowForm = () => {
  const { vatRowDetail, closeDetail, loading } = useVatRowDetail();
  const { editVatRow, loading: editLoading } = useVatRowEdit();
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
      <VatRowForm form={form} onSubmit={handleSubmit} loading={editLoading} />
      {loading && (
        <div className="absolute inset-0 bg-background/10 backdrop-blur-xs flex items-center justify-center rounded-md">
          <Spinner />
        </div>
      )}
    </>
  );
};

export const EditVatRow = () => {
  const [open, setOpen] = useQueryState<string>('vat_row_id');
  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <AccountingSheet title="НӨАТ-ын үзүүлэлт засах">
        <EditVatRowForm />
      </AccountingSheet>
    </Sheet>
  );
};
