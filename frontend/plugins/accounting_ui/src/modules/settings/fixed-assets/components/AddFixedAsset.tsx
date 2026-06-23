import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, ScrollArea, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { FIXED_ASSET_DEFAULT_VALUES } from '../constants/defaultValues';
import { fixedAssetSchema } from '../constants/schema';
import { useFixedAssetAdd } from '../hooks/useFixedAssetMutations';
import { TFixedAssetForm } from '../types/FixedAsset';
import { FixedAssetForm } from './FixedAssetForm';

export const AddFixedAsset = () => (
  <Sheet>
    <Sheet.Trigger asChild>
      <Button>
        <IconPlus />
        Хөрөнгө нэмэх
      </Button>
    </Sheet.Trigger>
    <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none md:max-w-4xl">
      <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
        <Sheet.Title>Үндсэн хөрөнгө нэмэх</Sheet.Title>
        <Sheet.Close />
        <Sheet.Description className="sr-only">
          Үндсэн хөрөнгө нэмэх
        </Sheet.Description>
      </Sheet.Header>
      <Sheet.Content className="overflow-hidden flex-auto">
        <ScrollArea className="h-full">
          <div className="p-5">
            <AddFixedAssetForm />
          </div>
        </ScrollArea>
      </Sheet.Content>
    </Sheet.View>
  </Sheet>
);

const AddFixedAssetForm = () => {
  const form = useForm<TFixedAssetForm>({
    resolver: zodResolver(fixedAssetSchema),
    defaultValues: FIXED_ASSET_DEFAULT_VALUES,
  });
  const { addFixedAsset, loading } = useFixedAssetAdd();

  const handleSubmit = (data: TFixedAssetForm) => {
    addFixedAsset({
      variables: data,
      onCompleted: () => form.reset(),
    });
  };

  return (
    <FixedAssetForm form={form} handleSubmit={handleSubmit} loading={loading} />
  );
};
