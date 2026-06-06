import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useMSDynamicConfigActions } from '../../hooks/useMSDynamicConfigActions';
import { useMSDynamicConfigs } from '../../hooks/useMSDynamicConfigs';
import { msDynamicConfigDetailAtom } from '../../states/msDynamicConfigStates';
import { addMSDynamicConfigSchema } from '../../types/addMSDynamicConfigSchema';
import {
  createEmptyMSDynamicConfig,
  TMSDynamicConfig,
  toMSDynamicFormValues,
} from '../../types';
import { MSDynamicConfigSheet } from './MSDynamicConfigSheet';

const FORM_ID = 'edit-msdynamic-config-form';

export const EditMSDynamicConfig = () => {
  const [editDetail, setEditDetail] = useAtom(msDynamicConfigDetailAtom);
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
  const { reset } = form;

  useEffect(() => {
    if (editDetail) {
      reset(toMSDynamicFormValues(editDetail));
    }
  }, [editDetail, reset]);

  const handleClose = (open: boolean) => {
    if (!open) setEditDetail(null);
  };

  const handleSubmit = async (data: TMSDynamicConfig) => {
    if (!editDetail) return;

    const saved = await saveConfig(data, 'update', editDetail.configKey);

    if (saved) {
      setEditDetail(null);
      reset(createEmptyMSDynamicConfig());
    }
  };

  return (
    <MSDynamicConfigSheet
      form={form}
      formId={FORM_ID}
      loading={isLoading}
      onOpenChange={handleClose}
      onSubmit={handleSubmit}
      open={editDetail !== null}
      title="Edit config"
    />
  );
};
