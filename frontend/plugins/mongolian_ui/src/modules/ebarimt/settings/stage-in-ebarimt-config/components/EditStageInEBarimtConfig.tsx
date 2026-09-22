import { Sheet, toast, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  addEBarimtStageInConfigSchema,
  getStageInEBarimtFormValues,
  STAGE_IN_EBARIMT_DEFAULT_VALUES,
  TStageInEbarimtConfig,
} from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import { useSaveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useSaveStageInEbarimtConfig';
import { EBarimtConfigFormSheet } from '@/ebarimt/settings/components/EBarimtConfigFormSheet';
import { useEBarimtConfigEdit } from '@/ebarimt/settings/hooks/useEBarimtConfigEdit';
import { StageInEBarimtConfigFormFields } from './StageInEBarimtConfigFormFields';

const FORM_ID = 'edit-stage-in-ebarimt-form';

export const EditStageInEBarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const [open, setOpen] = useQueryState<string>('stage_in_ebarimt_id');
  const { saveStageInEbarimtConfig } = useSaveStageInEbarimtConfig();
  const [loading, setLoading] = useState(false);

  const form = useForm<TStageInEbarimtConfig>({
    resolver: zodResolver(addEBarimtStageInConfigSchema),
    defaultValues: STAGE_IN_EBARIMT_DEFAULT_VALUES,
  });

  const { reset } = form;
  const { isConfigLoaded } = useEBarimtConfigEdit({
    code: 'stageInEbarimt',
    configId: open,
    getFormValues: getStageInEBarimtFormValues,
    query: GET_MN_CONFIGS,
    reset,
  });

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null);
      reset();
    }
  };

  const handleSubmit = async (data: TStageInEbarimtConfig) => {
    if (!open || !isConfigLoaded) return;
    try {
      setLoading(true);
      await saveStageInEbarimtConfig(data, 'update', open);
      setOpen(null);
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-save-config'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open !== null} onOpenChange={handleClose}>
      <EBarimtConfigFormSheet
        formId={FORM_ID}
        loading={loading || !isConfigLoaded}
        title={t('edit-stage-in-ebarimt-config')}
      >
        <StageInEBarimtConfigFormFields
          form={form}
          onSubmit={handleSubmit}
          formId={FORM_ID}
        />
      </EBarimtConfigFormSheet>
    </Sheet>
  );
};
