import { zodResolver } from '@hookform/resolvers/zod';
import { isDeeplyEqual, Sheet, Spinner, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
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
      <AccountingSheet title="Үндсэн хөрөнгө засах" className="md:max-w-4xl">
        <EditFixedAssetForm />
      </AccountingSheet>
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
