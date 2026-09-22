import { Sheet, Button, toast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  addEBarimtPosInConfigSchema,
  POS_IN_EBARIMT_DEFAULT_VALUES,
  TPosInEbarimtConfig,
} from '@/ebarimt/settings/pos-in-ebarimt-config/types';
import { useSavePosInEbarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/hooks/useSavePosInEbarimtConfig';
import { EBarimtConfigFormSheet } from '@/ebarimt/settings/components/EBarimtConfigFormSheet';
import { PosInEBarimtConfigFormFields } from './PosInEBarimtConfigFormFields';
import { useTranslation } from 'react-i18next';

const FORM_ID = 'add-pos-in-ebarimt-form';

export const AddPosInEBarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const [open, setOpen] = useState(false);
  const { savePosInEbarimtConfig, loading } = useSavePosInEbarimtConfig();

  const form = useForm<TPosInEbarimtConfig>({
    resolver: zodResolver(addEBarimtPosInConfigSchema),
    defaultValues: POS_IN_EBARIMT_DEFAULT_VALUES,
  });

  const handleSubmit = async (data: TPosInEbarimtConfig) => {
    try {
      await savePosInEbarimtConfig(data, 'create');
      setOpen(false);
      form.reset();
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-create-config'),
        variant: 'destructive',
      });
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
        title={t('add-pos-in-ebarimt-config')}
      >
        <PosInEBarimtConfigFormFields
          form={form}
          onSubmit={handleSubmit}
          formId={FORM_ID}
        />
      </EBarimtConfigFormSheet>
    </Sheet>
  );
};
