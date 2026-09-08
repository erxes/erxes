import { zodResolver } from '@hookform/resolvers/zod';
import { isDeeplyEqual, Sheet, Spinner, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { FIXED_ASSET_CATEGORY_DEFAULT_VALUES } from '../constants/defaultValues';
import { fixedAssetCategorySchema } from '../constants/schema';
import { useFixedAssetCategoryDetail } from '../hooks/useFixedAssetCategoryDetail';
import { useFixedAssetCategoryEdit } from '../hooks/useFixedAssetMutations';
import { TFixedAssetCategoryForm } from '../types/FixedAsset';
import { FixedAssetCategoryForm } from './FixedAssetCategoryForm';

const roundRate = (value: number) => Math.round(value * 100) / 100;

const getUsefulLifeFromRate = (annualRate?: number) =>
  annualRate && annualRate > 0 ? roundRate(100 / annualRate) : undefined;

export const EditFixedAssetCategory = () => {
  const [open, setOpen] = useQueryState<string>('fixedAssetCategoryId');

  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <AccountingSheet
        title="Үндсэн хөрөнгийн бүлэг засах"
        className="md:max-w-4xl"
      >
        <EditFixedAssetCategoryForm />
      </AccountingSheet>
    </Sheet>
  );
};

const EditFixedAssetCategoryForm = () => {
  const { fixedAssetCategoryDetail, closeDetail, loading } =
    useFixedAssetCategoryDetail();
  const { editFixedAssetCategory, loading: editLoading } =
    useFixedAssetCategoryEdit();
  const form = useForm<TFixedAssetCategoryForm>({
    resolver: zodResolver(fixedAssetCategorySchema),
    defaultValues: FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
  });
  const { reset } = form;

  useEffect(() => {
    if (fixedAssetCategoryDetail) {
      reset({
        ...FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
        ...fixedAssetCategoryDetail,
        defaultUsefulLife: getUsefulLifeFromRate(
          fixedAssetCategoryDetail.defaultAnnualDepreciationRate,
        ),
        defaultTaxUsefulLife: getUsefulLifeFromRate(
          fixedAssetCategoryDetail.defaultTaxAnnualDepreciationRate,
        ),
      });
    }
  }, [fixedAssetCategoryDetail, reset]);

  const handleSubmit = (data: TFixedAssetCategoryForm) => {
    const initialData = {
      ...FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
      ...fixedAssetCategoryDetail,
      defaultUsefulLife: getUsefulLifeFromRate(
        fixedAssetCategoryDetail?.defaultAnnualDepreciationRate,
      ),
      defaultTaxUsefulLife: getUsefulLifeFromRate(
        fixedAssetCategoryDetail?.defaultTaxAnnualDepreciationRate,
      ),
    };

    if (isDeeplyEqual({ ...initialData, ...data }, initialData)) {
      reset();
      return closeDetail();
    }

    editFixedAssetCategory({
      variables: {
        _id: fixedAssetCategoryDetail?._id,
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
      <FixedAssetCategoryForm
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
