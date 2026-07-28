import { Sheet, Button, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  addEBarimtStageInConfigSchema,
  STAGE_IN_EBARIMT_DEFAULT_VALUES,
  TStageInEbarimtConfig,
} from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { useSaveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useSaveStageInEbarimtConfig';
import { EBarimtConfigFormSheet } from '@/ebarimt/settings/components/EBarimtConfigFormSheet';
import { StageInEBarimtConfigFormFields } from './StageInEBarimtConfigFormFields';

const FORM_ID = 'add-stage-in-ebarimt-form';

export const AddStageInEBarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const [open, setOpen] = useState(false);
  const { saveStageInEbarimtConfig } = useSaveStageInEbarimtConfig();
  const [loading, setLoading] = useState(false);

  const form = useForm<TStageInEbarimtConfig>({
    resolver: zodResolver(addEBarimtStageInConfigSchema),
    defaultValues: STAGE_IN_EBARIMT_DEFAULT_VALUES,
  });

  const handleSubmit = async (data: TStageInEbarimtConfig) => {
    try {
      setLoading(true);
      await saveStageInEbarimtConfig(data, 'create');
      setOpen(false);
      form.reset(STAGE_IN_EBARIMT_DEFAULT_VALUES);
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-create-config'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-config')}
        </Button>
      </Sheet.Trigger>
      <EBarimtConfigFormSheet
        formId={FORM_ID}
        loading={loading}
        title={t('add-stage-in-ebarimt-config')}
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
