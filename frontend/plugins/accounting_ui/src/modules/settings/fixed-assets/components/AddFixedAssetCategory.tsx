import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, ScrollArea, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { FIXED_ASSET_CATEGORY_DEFAULT_VALUES } from '../constants/defaultValues';
import { fixedAssetCategorySchema } from '../constants/schema';
import { useFixedAssetCategoryAdd } from '../hooks/useFixedAssetMutations';
import { TFixedAssetCategoryForm } from '../types/FixedAsset';
import { FixedAssetCategoryForm } from './FixedAssetCategoryForm';

export const AddFixedAssetCategory = () => (
  <Sheet>
    <Sheet.Trigger asChild>
      <Button>
        <IconPlus />
        Бүлэг нэмэх
      </Button>
    </Sheet.Trigger>
    <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
      <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
        <Sheet.Title>Үндсэн хөрөнгийн бүлэг нэмэх</Sheet.Title>
        <Sheet.Close />
        <Sheet.Description className="sr-only">
          Үндсэн хөрөнгийн бүлэг нэмэх
        </Sheet.Description>
      </Sheet.Header>
      <Sheet.Content className="overflow-hidden flex-auto">
        <ScrollArea className="h-full">
          <div className="p-5">
            <AddFixedAssetCategoryForm />
          </div>
        </ScrollArea>
      </Sheet.Content>
    </Sheet.View>
  </Sheet>
);

const AddFixedAssetCategoryForm = () => {
  const form = useForm<TFixedAssetCategoryForm>({
    resolver: zodResolver(fixedAssetCategorySchema),
    defaultValues: FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
  });
  const { addFixedAssetCategory, loading } = useFixedAssetCategoryAdd();

  const handleSubmit = (data: TFixedAssetCategoryForm) => {
    addFixedAssetCategory({
      variables: data,
      onCompleted: () => form.reset(),
    });
  };

  return (
    <FixedAssetCategoryForm
      form={form}
      handleSubmit={handleSubmit}
      loading={loading}
    />
  );
};
