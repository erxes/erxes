import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import { Spinner, toast } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { CALL_PRO_INTEGRATION_FORM_SCHEMA } from '@/integrations/callpro/constants/callProIntegrationSchema';
import { CallProIntegrationForm } from '@/integrations/callpro/components/CallProIntegrationForm';
import { useCallProIntegrationDetail } from '@/integrations/callpro/hooks/useCallProIntegrationDetail';
import { CALL_PRO_INTEGRATION_DETAIL } from '@/integrations/callpro/graphql/queries/callProQueries';

const useFormDraft =
  createIntegrationFormDraft<
    z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>
  >();

/** Loads and edits the selected Call Pro line's name, brand, and connection. */
export const CallProIntegrationEdit = ({
  id: integrationId,
}: {
  id: string;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });

  const { close } = useSidePanel();
  const { integrationDetail, loading } = useIntegrationDetail({
    integrationId,
  });
  const { callProIntegrationDetail, loading: callProLoading } =
    useCallProIntegrationDetail(integrationId);

  const { editIntegration, loading: editLoading } = useIntegrationEdit();

  const form = useForm<z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>>({
    resolver: zodResolver(CALL_PRO_INTEGRATION_FORM_SCHEMA),
  });

  const { markSaved, isActive, getSaveValues } = useFormDraft(form, {
    name: integrationDetail?.name || '',
    brandId: integrationDetail?.brandId || '',
    phoneNumber: callProIntegrationDetail?.phoneNumber || '',
    recordUrl: callProIntegrationDetail?.recordUrl || '',
  });

  const onSubmit = (data: z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>) => {
    if (!integrationId || !integrationDetail) return;
    const submittedValues = data;
    const savedValues = getSaveValues(data);
    editIntegration({
      variables: {
        _id: integrationId,
        name: savedValues.name,
        channelId: integrationDetail.channelId ?? '',
        brandId: savedValues.brandId,
        details: {
          phoneNumber: savedValues.phoneNumber,
          recordUrl: savedValues.recordUrl || '',
        },
      },
      refetchQueries: [
        'Integrations',
        'IntegrationDetail',
        {
          query: CALL_PRO_INTEGRATION_DETAIL,
          variables: { integrationId },
        },
        'ChannelIntegrationsPeek',
      ],
      onCompleted() {
        if (markSaved(savedValues, submittedValues) && isActive()) close();
        toast({
          title: t('integration-updated'),
          description: t('integration-updated-successfully'),
        });
      },
      onError(e) {
        toast({
          title: t('something-went-wrong'),
          description: e.message,
          variant: 'destructive',
        });
      },
    });
  };

  if (loading || callProLoading) {
    return <Spinner className="h-full" />;
  }

  return (
    <CallProIntegrationForm
      form={form}
      onSubmit={onSubmit}
      loading={editLoading}
    />
  );
};

export { CallProIntegrationEdit as CallProIntegrationSheetEdit };
