import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { IntegrationType } from '@/types/Integration';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, toast } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { SelectBrands } from 'ui-modules';
import { z } from 'zod';
import { WHATSAPP_INTEGRATION_SCHEMA } from '../constants/whatsappIntegrationSchema';
import {
  activeWhatsappFormStepAtom,
  resetWhatsappAddStateAtom,
  selectedWhatsappAccountAtom,
  selectedWhatsappBusinessAccountAtom,
  selectedWhatsappPageAtom,
  selectedWhatsappPhoneNumberAtom,
} from '../states/whatsappStates';
import {
  WhatsappIntegrationFormLayout,
  WhatsappIntegrationFormSteps,
} from './WhatsappIntegrationForm';

export const WhatsappIntegrationSetup = () => {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams();
  const form = useForm<z.infer<typeof WHATSAPP_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(WHATSAPP_INTEGRATION_SCHEMA),
    defaultValues: {
      name: '',
      brandId: '',
    },
  });

  const accountId = useAtomValue(selectedWhatsappAccountAtom);
  const pageId = useAtomValue(selectedWhatsappPageAtom);
  const businessAccountId = useAtomValue(selectedWhatsappBusinessAccountAtom);
  const phoneNumberId = useAtomValue(selectedWhatsappPhoneNumberAtom);

  const { addIntegration, loading } = useIntegrationAdd();

  const resetWhatsappForm = useSetAtom(resetWhatsappAddStateAtom);
  const setActiveStep = useSetAtom(activeWhatsappFormStepAtom);

  const onNext = (data: z.infer<typeof WHATSAPP_INTEGRATION_SCHEMA>) => {
    if (!channelId || !accountId || !businessAccountId || !phoneNumberId) {
      toast({
        title: t('failed-to-add-integration'),
        description: t(
          'whatsapp-missing-selection',
          'Select a channel, Facebook account, business account and phone number before saving.',
        ),
        variant: 'destructive',
      });
      return;
    }

    addIntegration({
      variables: {
        kind: IntegrationType.WHATSAPP_MESSENGER,
        name: data.name,
        accountId,
        channelId,
        brandId: data.brandId,
        data: {
          pageId,
          businessAccountId,
          phoneNumberId,
        },
      },
      onCompleted: () => {
        toast({
          title: t('integration-added'),
          variant: 'default',
        });
        resetWhatsappForm();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-1"
        onSubmit={form.handleSubmit(onNext)}
      >
        <WhatsappIntegrationFormLayout
          actions={
            <>
              <Button
                type="button"
                variant="secondary"
                className="bg-border"
                onClick={() => setActiveStep(3)}
              >
                {t('previous-step')}
              </Button>
              <Button type="submit" disabled={loading}>
                {t('save')}
              </Button>
            </>
          }
        >
          <WhatsappIntegrationFormSteps
            title={t('integration-setup')}
            step={4}
            description=""
          />
          <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col gap-4">
            <Form.Field
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('integration-name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Description>
                    {t('integration-name-description')}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="brandId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('brand')}</Form.Label>
                  <Form.Control>
                    <SelectBrands.FormItem
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Description>
                    {t('choose-brand-description')}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </WhatsappIntegrationFormLayout>
      </form>
    </Form>
  );
};
