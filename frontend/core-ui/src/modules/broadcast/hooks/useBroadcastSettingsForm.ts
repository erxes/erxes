import { useConfig } from '@/settings/file-upload/hook/useConfigs';
import { useEffect } from 'react';
import { ControllerRenderProps, FieldValues, useForm } from 'react-hook-form';
import { useBroadcastConfig } from './useBroadcastConfig';
import {
  BROADCAST_CONFIG_CODES,
  TBroadcastEmailSettings,
  useBroadcastEmailCredentials,
} from './useBroadcastEmailCredentials';

/**
 * The broadcast settings form, filled from the saved configs. Each field saves
 * itself when it is left, so there is no submit.
 */
export const useBroadcastSettingsForm = () => {
  const form = useForm<TBroadcastEmailSettings>();

  const { configs } = useConfig();

  const { updateConfig } = useBroadcastConfig();

  const { showCredentials, usesOwnCredentials, providerFields } =
    useBroadcastEmailCredentials(form);

  useEffect(() => {
    if (!configs) return;

    const values = BROADCAST_CONFIG_CODES.reduce((acc, name) => {
      const config = configs.find((c: { code: string }) => c.code === name);

      if (config) acc[name] = config.value;

      return acc;
    }, {} as Partial<TBroadcastEmailSettings>);

    form.reset(values);
  }, [configs, form]);

  const handleFieldChange = (
    field: ControllerRenderProps<FieldValues, string>,
  ) => {
    const { name, value } = field || {};

    if (!name) return;

    if (!form.formState.dirtyFields[name]) return;

    updateConfig({ [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    form.setValue(name, value, { shouldDirty: true });
    updateConfig({ [name]: value });
  };

  return {
    form,
    showCredentials,
    usesOwnCredentials,
    providerFields,
    handleFieldChange,
    handleSelectChange,
  };
};
