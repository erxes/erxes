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
import { FIXED_ASSET_CATEGORY_DEFAULT_VALUES } from '../constants/defaultValues';
import { fixedAssetCategorySchema } from '../constants/schema';
import { useFixedAssetCategoryDetail } from '../hooks/useFixedAssetCategoryDetail';
import { useFixedAssetCategoryEdit } from '../hooks/useFixedAssetMutations';
import { TFixedAssetCategoryForm } from '../types/FixedAsset';
import { FixedAssetCategoryForm } from './FixedAssetCategoryForm';

export const EditFixedAssetCategory = () => {
  const [open, setOpen] = useQueryState<string>('fixedAssetCategoryId');

  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
        <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
          <Sheet.Title>Үндсэн хөрөнгийн бүлэг засах</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Үндсэн хөрөнгийн бүлэг засах
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <EditFixedAssetCategoryForm />
            </div>
          </ScrollArea>
        </Sheet.Content>
      </Sheet.View>
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
      });
    }
  }, [fixedAssetCategoryDetail, reset]);

  const handleSubmit = (data: TFixedAssetCategoryForm) => {
    const initialData = {
      ...FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
      ...fixedAssetCategoryDetail,
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
