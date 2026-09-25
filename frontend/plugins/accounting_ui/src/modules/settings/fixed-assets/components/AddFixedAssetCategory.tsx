import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { FIXED_ASSET_CATEGORY_DEFAULT_VALUES } from '../constants/defaultValues';
import { fixedAssetCategorySchema } from '../constants/schema';
import { useFixedAssetCategoryAdd } from '../hooks/useFixedAssetMutations';
import { TFixedAssetCategoryForm } from '../types/FixedAsset';
import { FixedAssetCategoryForm } from './FixedAssetCategoryForm';

export const AddFixedAssetCategory = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Бүлэг нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet
        title="Үндсэн хөрөнгийн бүлэг нэмэх"
        className="md:max-w-4xl"
      >
        <AddFixedAssetCategoryForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};

const AddFixedAssetCategoryForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<TFixedAssetCategoryForm>({
    resolver: zodResolver(fixedAssetCategorySchema),
    defaultValues: FIXED_ASSET_CATEGORY_DEFAULT_VALUES,
  });
  const { addFixedAssetCategory, loading } = useFixedAssetCategoryAdd();

  const handleSubmit = (data: TFixedAssetCategoryForm) => {
    addFixedAssetCategory({
      variables: data,
      onCompleted: () => {
        form.reset();
        setOpen(false);
      },
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
