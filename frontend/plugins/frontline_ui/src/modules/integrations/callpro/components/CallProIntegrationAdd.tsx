import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import { useSidePanel } from 'ui-modules';
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

const useFormDraft =
  createIntegrationFormDraft<
    z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>
  >();

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

/** Creates a Call Pro integration through the record panel form. */
export const CallProIntegrationAdd = () => {
  const id = useIntegrationChannelId();
  const { close } = useSidePanel();

  const form = useForm<z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>>({
    resolver: zodResolver(CALL_PRO_INTEGRATION_FORM_SCHEMA),
    defaultValues: {
      name: '',
      phoneNumber: '',
      recordUrl: '',
      brandId: '',
    },
  });
  const { clearDraft, isActive } = useFormDraft(form);

  const { addIntegration, loading } = useIntegrationAdd();

  /** Creates a Call Pro line and clears the form before closing on success. */
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
      onCompleted(result) {
        if (!result.integrationsCreateExternalIntegration?._id) return;
        clearDraft();
        form.reset();
        if (isActive()) close();
      },
    });
  };

  return (
    <CallProIntegrationForm form={form} onSubmit={onSubmit} loading={loading} />
  );
};
