import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Collapsible,
  Dialog,
  Form,
  getPluginAssetsUrl,
  Input,
  Skeleton,
  Spinner,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import { whatsappConfigSchema } from '../constants/whatsappConfigSchema';
import { useWhatsappGetConfigs } from '../hooks/useWhatsappGetConfigs';
import { useWhatsappUpdateConfigs } from '../hooks/useWhatsappUpdateConfigs';

export const WhatsappConfigUpdateCollapse = () => {
  return (
    <Collapsible className="w-full bg-muted rounded-lg">
      <Collapsible.Trigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="w-full h-auto flex justify-start group bg-transparent hover:bg-transparent gap-3 px-3 font-semibold"
        >
          <Collapsible.TriggerIcon className="text-accent-foreground" />
          <IntegrationLogo
            img={getPluginAssetsUrl(
              'frontline',
              INTEGRATIONS[IntegrationType.WHATSAPP_MESSENGER].img,
            )}
            name={INTEGRATIONS[IntegrationType.WHATSAPP_MESSENGER].name}
          />
          {INTEGRATIONS[IntegrationType.WHATSAPP_MESSENGER].name}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="shadow-xs rounded-lg p-3 bg-background">
        <WhatsappConfigUpdate />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const WhatsappConfigUpdate = () => {
  const { t } = useTranslation('frontline');
  const confirmationValue = 'update';
  const { confirm } = useConfirm();
  const form = useForm<z.infer<typeof whatsappConfigSchema>>({
    resolver: zodResolver(whatsappConfigSchema),
    defaultValues: {
      WHATSAPP_VERIFY_TOKEN: '',
    },
  });

  const {
    whatsappConfigs,
    loading: loadingWhatsappConfigs,
    error: configsError,
    refetch: refetchConfigs,
  } = useWhatsappGetConfigs();
  const { updateConfigs, loading } = useWhatsappUpdateConfigs();

  useEffect(() => {
    if (loadingWhatsappConfigs) {
      return;
    }

    form.reset({
      WHATSAPP_VERIFY_TOKEN: whatsappConfigs.WHATSAPP_VERIFY_TOKEN ?? '',
    });
  }, [form, loadingWhatsappConfigs, whatsappConfigs]);

  const onSubmit = (data: z.infer<typeof whatsappConfigSchema>) => {
    confirm({
      message: t(
        'whatsapp-confirm-update-configs',
        'Are you sure you want to update the WhatsApp configs?',
      ),
      options: { confirmationValue },
    }).then(() => {
      updateConfigs({
        variables: {
          configsMap: data,
        },
        onCompleted: () => {
          toast({
            title: t(
              'whatsapp-configs-updated',
              'WhatsApp configs updated successfully',
            ),
            variant: 'success',
          });
        },
        onError: (error) => {
          toast({
            title: t('failed-to-save-configs'),
            description: error?.message,
            variant: 'destructive',
          });
        },
      });
    });
  };

  if (loadingWhatsappConfigs) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8" />
      </div>
    );
  }

  if (configsError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="text-sm font-medium text-destructive">
          {t('failed-to-load-configs', 'Failed to load configs')}
        </div>
        <div className="text-sm text-muted-foreground">
          {configsError.message}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => refetchConfigs()}
        >
          {t('retry', 'Retry')}
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <Form.Field
          name="WHATSAPP_VERIFY_TOKEN"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('verify-token', 'Verify Token')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Description>
                {t(
                  'whatsapp-verify-token-description',
                  'Used by Meta to verify the WhatsApp webhook. Connect WhatsApp from a channel\'s integration list instead of entering account credentials here.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Dialog.Footer className="items-center">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : t('save')}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
