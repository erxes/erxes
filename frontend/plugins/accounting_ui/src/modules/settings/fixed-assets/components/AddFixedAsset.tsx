import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { FIXED_ASSET_DEFAULT_VALUES } from '../constants/defaultValues';
import { fixedAssetSchema } from '../constants/schema';
import { useFixedAssetAdd } from '../hooks/useFixedAssetMutations';
import { TFixedAssetForm } from '../types/FixedAsset';
import { FixedAssetForm } from './FixedAssetForm';

export const AddFixedAsset = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Хөрөнгө нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="Үндсэн хөрөнгө нэмэх" className="md:max-w-4xl">
        <AddFixedAssetForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};

const AddFixedAssetForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<TFixedAssetForm>({
    resolver: zodResolver(fixedAssetSchema),
    defaultValues: FIXED_ASSET_DEFAULT_VALUES,
  });
  const { addFixedAsset, loading } = useFixedAssetAdd();

  const handleSubmit = (data: TFixedAssetForm) => {
    addFixedAsset({
      variables: data,
      onCompleted: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <FixedAssetForm form={form} handleSubmit={handleSubmit} loading={loading} />
  );
};
