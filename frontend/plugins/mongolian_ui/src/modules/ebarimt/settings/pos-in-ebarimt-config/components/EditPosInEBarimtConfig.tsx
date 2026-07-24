import { Sheet, toast, useQueryState } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  addEBarimtPosInConfigSchema,
  getPosInEBarimtFormValues,
  POS_IN_EBARIMT_DEFAULT_VALUES,
  TPosInEbarimtConfig,
} from '@/ebarimt/settings/pos-in-ebarimt-config/types';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';
import { useSavePosInEbarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/hooks/useSavePosInEbarimtConfig';
import { EBarimtConfigFormSheet } from '@/ebarimt/settings/components/EBarimtConfigFormSheet';
import { useEBarimtConfigEdit } from '@/ebarimt/settings/hooks/useEBarimtConfigEdit';
import { PosInEBarimtConfigFormFields } from './PosInEBarimtConfigFormFields';
import { useTranslation } from 'react-i18next';

const FORM_ID = 'edit-pos-in-ebarimt-form';

export const EditPosInEBarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const [open, setOpen] = useQueryState<string>('pos_in_ebarimt_id');
  const { savePosInEbarimtConfig, loading } = useSavePosInEbarimtConfig();

  const form = useForm<TPosInEbarimtConfig>({
    resolver: zodResolver(addEBarimtPosInConfigSchema),
    defaultValues: POS_IN_EBARIMT_DEFAULT_VALUES,
  });

  const { reset } = form;
  const { isConfigLoaded } = useEBarimtConfigEdit({
    code: 'posInEbarimt',
    configId: open,
    getFormValues: getPosInEBarimtFormValues,
    query: GET_MN_CONFIGS,
    reset,
  });

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null);
      reset();
    }
  };

  const handleSubmit = async (data: TPosInEbarimtConfig) => {
    if (!open || !isConfigLoaded) return;
    try {
      await savePosInEbarimtConfig(data, 'update', open);
      setOpen(null);
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-save-config'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open !== null} onOpenChange={handleClose}>
      <EBarimtConfigFormSheet
        formId={FORM_ID}
        loading={loading || !isConfigLoaded}
        title={t('edit-pos-in-ebarimt-config')}
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
