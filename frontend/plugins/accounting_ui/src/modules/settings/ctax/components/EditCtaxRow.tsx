import { Sheet, Spinner, isDeeplyEqual, useQueryState } from 'erxes-ui';

import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { CtaxRowForm } from './CtaxRowForm';
import { TCtaxRowForm } from '../types/CtaxRow';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';
import { useCtaxRowDetail } from '../hooks/useCtaxRowDetail';
import { useCtaxRowEdit } from '../hooks/useCtaxRowEdit';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const EditCtaxRowForm = ({ onClose }: { onClose?: () => void }) => {
  const { ctaxRowDetail, closeDetail, loading } = useCtaxRowDetail();
  const { editCtaxRow, loading: editLoading } = useCtaxRowEdit();
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
      return onClose ? onClose() : closeDetail();
    }
    editCtaxRow({
      variables: {
        _id: ctaxRowDetail?._id,
        ...data,
      },
      onCompleted: () => {
        onClose ? onClose() : closeDetail();
        reset();
      },
    });
  };

  return (
    <>
      <CtaxRowForm form={form} onSubmit={handleSubmit} loading={editLoading} />
      {loading && (
        <div className="absolute inset-0 bg-background/10 backdrop-blur-xs flex items-center justify-center rounded-md">
          <Spinner />
        </div>
      )}
    </>
  );
};

export const EditCtaxRow = () => {
  const [open, setOpen] = useQueryState<string>('ctax_row_id');
  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <AccountingSheet title="НХАТ-ын мөр засах">
        <EditCtaxRowForm onClose={() => setOpen(null)} />
      </AccountingSheet>
    </Sheet>
  );
};
