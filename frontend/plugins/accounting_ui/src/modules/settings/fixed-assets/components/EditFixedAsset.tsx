import { zodResolver } from '@hookform/resolvers/zod';
import {
  isDeeplyEqual,
  ScrollArea,
  Sheet,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FIXED_ASSET_DEFAULT_VALUES } from '../constants/defaultValues';
import { fixedAssetSchema } from '../constants/schema';
import { useFixedAssetDetail } from '../hooks/useFixedAssetDetail';
import { useFixedAssetEdit } from '../hooks/useFixedAssetMutations';
import { TFixedAssetForm } from '../types/FixedAsset';
import { FixedAssetForm } from './FixedAssetForm';

export const EditFixedAsset = () => {
  const [open, setOpen] = useQueryState<string>('fixedAssetId');

  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none md:max-w-4xl">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>Үндсэн хөрөнгө засах</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Үндсэн хөрөнгө засах
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <EditFixedAssetForm />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

const EditFixedAssetForm = () => {
  const { fixedAssetDetail, closeDetail, loading } = useFixedAssetDetail();
  const { editFixedAsset, loading: editLoading } = useFixedAssetEdit();
  const form = useForm<TFixedAssetForm>({
    resolver: zodResolver(fixedAssetSchema),
    defaultValues: FIXED_ASSET_DEFAULT_VALUES,
  });
  const { reset } = form;

  useEffect(() => {
    if (fixedAssetDetail) {
      reset({
        ...FIXED_ASSET_DEFAULT_VALUES,
        ...fixedAssetDetail,
      });
    }
  }, [fixedAssetDetail, reset]);

  const handleSubmit = (data: TFixedAssetForm) => {
    const initialData = {
      ...FIXED_ASSET_DEFAULT_VALUES,
      ...fixedAssetDetail,
    };

    if (isDeeplyEqual({ ...initialData, ...data }, initialData)) {
      reset();
      return closeDetail();
    }

    editFixedAsset({
      variables: {
        _id: fixedAssetDetail?._id,
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
      <FixedAssetForm
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
