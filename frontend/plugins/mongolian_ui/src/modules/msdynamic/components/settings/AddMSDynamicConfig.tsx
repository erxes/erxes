import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'erxes-ui';

import { useMSDynamicConfigActions } from '../../hooks/useMSDynamicConfigActions';
import { useMSDynamicConfigs } from '../../hooks/useMSDynamicConfigs';
import { addMSDynamicConfigSchema } from '../../types/addMSDynamicConfigSchema';
import { createEmptyMSDynamicConfig, TMSDynamicConfig } from '../../types';
import { MSDynamicConfigSheet } from './MSDynamicConfigSheet';

const FORM_ID = 'add-msdynamic-config-form';

export const AddMSDynamicConfig = () => {
  const [open, setOpen] = useState(false);
  const {
    configsMap,
    loading: configsLoading,
    saveConfigs,
    saveLoading,
  } = useMSDynamicConfigs();
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
    <MSDynamicConfigSheet
      form={form}
      formId={FORM_ID}
      loading={isLoading}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      open={open}
      title="New config"
      trigger={
        <Button>
          <IconPlus />
          New config
        </Button>
      }
    />
  );
};
