import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Sheet, Spinner } from 'erxes-ui';

import { useMSDynamicConfigActions } from '../../hooks/useMSDynamicConfigActions';
import { useMSDynamicConfigs } from '../../hooks/useMSDynamicConfigs';
import { addMSDynamicConfigSchema } from '../../types/addMSDynamicConfigSchema';
import {
  createEmptyMSDynamicConfig,
  TMSDynamicConfig,
} from '../../types';
import { MSDynamicConfigFormFields } from './MSDynamicConfigFormFields';

const FORM_ID = 'add-msdynamic-config-form';

export const AddMSDynamicConfig = () => {
  const [open, setOpen] = useState(false);
  const { configsMap, loading: configsLoading, saveConfigs, saveLoading } =
    useMSDynamicConfigs();
  const { loading, saveConfig } = useMSDynamicConfigActions({
    configsMap,
    saveConfigs,
  });

  const isLoading = configsLoading || loading || saveLoading;
  const form = useForm<TMSDynamicConfig>({
    resolver: zodResolver(addMSDynamicConfigSchema),
    defaultValues: createEmptyMSDynamicConfig(),
  });

  const handleSubmit = async (data: TMSDynamicConfig) => {
    const saved = await saveConfig(data, 'create');

    if (saved) {
      setOpen(false);
      form.reset();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          New config
        </Button>
      </Sheet.Trigger>
      <Sheet.View side="right" className="bg-background sm:max-w-3xl">
        <Sheet.Header>
          <Sheet.Title>New config</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <MSDynamicConfigFormFields
            form={form}
            onSubmit={handleSubmit}
            formId={FORM_ID}
            loading={isLoading}
          />
        </div>
        <Sheet.Footer className="gap-2 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg" disabled={isLoading}>
              Cancel
            </Button>
          </Sheet.Close>
          <Button type="submit" form={FORM_ID} size="lg" disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Save'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
