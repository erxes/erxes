import { Sheet, Spinner, toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { z } from 'zod';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { CALL_PRO_INTEGRATION_FORM_SCHEMA } from '@/integrations/callpro/constants/callProIntegrationSchema';
import { CallProIntegrationForm } from '@/integrations/callpro/components/CallProIntegrationForm';
import { useCallProIntegrationDetail } from '@/integrations/callpro/hooks/useCallProIntegrationDetail';
import { callProEditSheetAtom } from '@/integrations/callpro/states/callProEditSheetAtom';

export const CallProIntegrationSheetEdit = () => {
  const [callProEditSheet, setCallProEditSheet] = useAtom(
    callProEditSheetAtom,
  );

  return (
    <Sheet
      open={!!callProEditSheet}
      onOpenChange={() => setCallProEditSheet(null)}
    >
      <Sheet.View className="sm:max-w-3xl">
        <CallProIntegrationEdit />
      </Sheet.View>
    </Sheet>
  );
};

export const CallProIntegrationEdit = () => {
  const { t } = useTranslation('frontline');
  const { id } = useParams();

  const [integrationId, setEditSheet] = useAtom(callProEditSheetAtom);
  const { integrationDetail, loading } = useIntegrationDetail({
    integrationId,
  });
  const { callProIntegrationDetail, loading: callProLoading } =
    useCallProIntegrationDetail();

  const { editIntegration, loading: editLoading } = useIntegrationEdit();

  const form = useForm<z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>>({
    resolver: zodResolver(CALL_PRO_INTEGRATION_FORM_SCHEMA),
  });

  const onSubmit = (data: z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>) => {
    editIntegration({
      variables: {
        _id: integrationId,
        name: data.name,
        channelId: id || '',
        brandId: data.brandId,
        details: {
          phoneNumber: data.phoneNumber,
          recordUrl: data.recordUrl || '',
        },
      },
      refetchQueries: [
        'Integrations',
        'IntegrationDetail',
        'callProIntegrationDetail',
      ],
      onCompleted() {
        setEditSheet(null);
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
        setEditSheet(null);
      },
    });
  };

  useEffect(() => {
    if (integrationDetail && !loading && !callProLoading) {
      form.reset({
        name: integrationDetail.name || '',
        brandId: integrationDetail.brandId || '',
        phoneNumber: callProIntegrationDetail?.phoneNumber || '',
        recordUrl: callProIntegrationDetail?.recordUrl || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationDetail, callProIntegrationDetail, callProLoading, loading]);

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
