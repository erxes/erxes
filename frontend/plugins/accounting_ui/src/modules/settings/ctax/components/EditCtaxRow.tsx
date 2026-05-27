import {
  Sheet,
  ScrollArea,
  isDeeplyEqual,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useCtaxRowDetail } from '../hooks/useCtaxRowDetail';
import { TCtaxRowForm } from '../types/CtaxRow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';
import { useEffect } from 'react';
import { useCtaxRowEdit } from '../hooks/useCtaxRowEdit';
import { CtaxRowForm } from './CtaxRowForm';

export const EditCtaxRow = () => {
  const [open, setOpen] = useQueryState<string>('ctax_row_id');
  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>НХАТ-ын мөр засах</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            НХАТ-ын мөр засах
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <EditCtaxRowForm onClose={() => setOpen(null)} />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

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
