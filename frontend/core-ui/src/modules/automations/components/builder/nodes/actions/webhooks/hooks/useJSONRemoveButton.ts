import { deleteAtJSONProperty } from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

/** Removing one property from the JSON body at the given path. */
export const useJSONRemoveButton = (
  name: string,
  path: Array<string | number>,
) => {
  const { getValues, setValue } = useFormContext();

  return useCallback(() => {
    const next = deleteAtJSONProperty(getValues(), path);
    setValue(name, next[name], { shouldDirty: true, shouldTouch: true });
  }, [getValues, setValue, name, path]);
};
