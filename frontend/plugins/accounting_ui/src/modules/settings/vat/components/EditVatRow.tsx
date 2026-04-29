import {
  Sheet,
  ScrollArea,
  isDeeplyEqual,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useVatRowDetail } from '../hooks/useVatRowDetail';
import { TVatRowForm } from '../types/VatRow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vatFormSchema } from '../constants/vatFormSchema';
import { useEffect } from 'react';
import { useVatRowEdit } from '../hooks/useVatRowEdit';
import { VatRowForm } from './VatRowForm';

export const EditVatRow = () => {
  const [open, setOpen] = useQueryState<string>('vat_row_id');
  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>Edit Vat Row</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Edit Vat Row Details
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <EditVatRowForm onClose={() => setOpen(null)} />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const EditVatRowForm = ({ onClose }: { onClose?: () => void }) => {
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
      <VatRowForm
        form={form}
        onSubmit={handleSubmit}
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
