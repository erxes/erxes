import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Sheet, Spinner } from 'erxes-ui';

import { useMSDynamicConfigActions } from '../../hooks/useMSDynamicConfigActions';
import { useMSDynamicConfigs } from '../../hooks/useMSDynamicConfigs';
import { msDynamicConfigDetailAtom } from '../../states/msDynamicConfigStates';
import { addMSDynamicConfigSchema } from '../../types/addMSDynamicConfigSchema';
import {
  createEmptyMSDynamicConfig,
  TMSDynamicConfig,
  toMSDynamicFormValues,
} from '../../types';
import { MSDynamicConfigFormFields } from './MSDynamicConfigFormFields';

const FORM_ID = 'edit-msdynamic-config-form';

export const EditMSDynamicConfig = () => {
  const [editDetail, setEditDetail] = useAtom(msDynamicConfigDetailAtom);
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
    <Sheet open={editDetail !== null} onOpenChange={handleClose}>
      <Sheet.View side="right" className="bg-background sm:max-w-3xl">
        <Sheet.Header>
          <Sheet.Title>Edit config</Sheet.Title>
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
