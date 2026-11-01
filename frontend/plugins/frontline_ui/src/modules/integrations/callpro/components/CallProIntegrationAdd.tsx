import { useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  IntegrationCreateButton,
  useIntegrationChannelId,
} from '@/integrations/components/IntegrationPanelForm';
import { z } from 'zod';
import { IntegrationType } from '@/types/Integration';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { CALL_PRO_INTEGRATION_FORM_SCHEMA } from '@/integrations/callpro/constants/callProIntegrationSchema';
import { CallProIntegrationForm } from '@/integrations/callpro/components/CallProIntegrationForm';
import { callProAddSheetAtom } from '@/integrations/callpro/states/callProAddSheetAtom';

export const CallProIntegrationAddSheet = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  return (
    <IntegrationCreateButton kind={IntegrationType.CALLPRO}>
      {t('callpro-add')}
    </IntegrationCreateButton>
  );
};

export const CallProIntegrationAdd = () => {
  const id = useIntegrationChannelId();
  const setCallProAddSheet = useSetAtom(callProAddSheetAtom);

  const form = useForm<z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>>({
    resolver: zodResolver(CALL_PRO_INTEGRATION_FORM_SCHEMA),
    defaultValues: {
      name: '',
      phoneNumber: '',
      recordUrl: '',
      brandId: '',
    },
  });

  const { addIntegration, loading } = useIntegrationAdd();

  const onSubmit = (data: z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>) => {
    addIntegration({
      variables: {
        name: `${data.name} - ${data.phoneNumber}`,
        kind: IntegrationType.CALLPRO,
        channelId: id || '',
        brandId: data.brandId,
        data: {
          phoneNumber: data.phoneNumber,
          recordUrl: data.recordUrl || '',
        },
      },
      onCompleted() {
        form.reset();
        setCallProAddSheet(false);
      },
    });
  };

  return (
    <CallProIntegrationForm form={form} onSubmit={onSubmit} loading={loading} />
  );
};
