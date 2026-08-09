import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Sheet, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SelectBrands } from 'ui-modules';
import { z } from 'zod';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { IntegrationType } from '@/types/Integration';
import { WHATSAPP_INTEGRATION_SCHEMA } from '../constants/whatsappSchema';

type WhatsappFormValues = z.infer<typeof WHATSAPP_INTEGRATION_SCHEMA>;

const DEFAULT_VALUES: WhatsappFormValues = {
  name: '',
  brandId: '',
  phoneNumberId: '',
  accessToken: '',
  whatsappBusinessAccountId: '',
  appSecret: '',
  verifyToken: '',
  defaultCountryCode: '',
};

export const WhatsappIntegrationDetail = () => {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams();
  const [open, setOpen] = useState(false);
  const { addIntegration, loading } = useIntegrationAdd();

  const form = useForm<WhatsappFormValues>({
    resolver: zodResolver(WHATSAPP_INTEGRATION_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });

  /**
   * `data` is forwarded as a plain object: the inbox resolver stringifies it
   * before handing it to the WhatsApp service, so stringifying here would
   * double-encode the credentials.
   */
  const onSubmit = (values: WhatsappFormValues) => {
    addIntegration({
      variables: {
        kind: IntegrationType.WHATSAPP_MESSENGER,
        name: values.name,
        channelId: channelId as string,
        brandId: values.brandId,
        data: {
          phoneNumberId: values.phoneNumberId.trim(),
          accessToken: values.accessToken.trim(),
          whatsappBusinessAccountId:
            values.whatsappBusinessAccountId?.trim() || undefined,
          appSecret: values.appSecret?.trim() || undefined,
          verifyToken: values.verifyToken?.trim() || undefined,
          defaultCountryCode: values.defaultCountryCode?.trim() || undefined,
        },
      },
      onCompleted: () => {
        setOpen(false);
        // Secrets are never read back from the server, so clearing the form is
        // the only way the token stops living in memory after a successful save.
        form.reset(DEFAULT_VALUES);
      },
    });
  };

  return (
    // skipcq: JS-0415
    <div>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) form.reset(DEFAULT_VALUES);
        }}
      >
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            {t('whatsapp-add-number')}
          </Button>
        </Sheet.Trigger>
        <Sheet.View>
          <Form {...form}>
            <form
              className="flex flex-col flex-1 overflow-hidden"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Sheet.Header>
                <Sheet.Title>{t('whatsapp-add-number')}</Sheet.Title>
                <Sheet.Description>
                  {t('whatsapp-connect-description')}
                </Sheet.Description>
                <Sheet.Close />
              </Sheet.Header>

              <Sheet.Content className="flex flex-col overflow-hidden">
                <IntegrationSteps
                  step={1}
                  stepsLength={1}
                  title={t('whatsapp-credentials')}
                  description={t('whatsapp-credentials-description')}
                />
                <div className="flex-1 overflow-auto p-4 pt-0 flex flex-col gap-4">
                  <Form.Field
                    name="phoneNumberId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('whatsapp-phone-number-id')}</Form.Label>
                        <Form.Control>
                          <Input {...field} autoComplete="off" />
                        </Form.Control>
                        <Form.Description>
                          {t('whatsapp-phone-number-id-description')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    name="accessToken"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('whatsapp-access-token')}</Form.Label>
                        <Form.Control>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                          />
                        </Form.Control>
                        <Form.Description>
                          {t('whatsapp-access-token-description')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    name="whatsappBusinessAccountId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('whatsapp-business-account-id')}
                        </Form.Label>
                        <Form.Control>
                          <Input {...field} autoComplete="off" />
                        </Form.Control>
                        <Form.Description>
                          {t('whatsapp-business-account-id-description')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    name="appSecret"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('whatsapp-app-secret')}</Form.Label>
                        <Form.Control>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                          />
                        </Form.Control>
                        <Form.Description>
                          {t('whatsapp-app-secret-description')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    name="verifyToken"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('whatsapp-verify-token')}</Form.Label>
                        <Form.Control>
                          <Input {...field} autoComplete="off" />
                        </Form.Control>
                        <Form.Description>
                          {t('whatsapp-verify-token-description')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    name="defaultCountryCode"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('whatsapp-default-country-code')}
                        </Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="+91" />
                        </Form.Control>
                        <Form.Description>
                          {t('whatsapp-default-country-code-description')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

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
              </Sheet.Content>

              <Sheet.Footer>
                <Sheet.Close asChild>
                  <Button
                    className="mr-auto text-muted-foreground"
                    variant="ghost"
                    type="button"
                  >
                    {t('cancel')}
                  </Button>
                </Sheet.Close>
                <Button type="submit" disabled={loading}>
                  {loading && <Spinner size="sm" />}
                  {t('save')}
                </Button>
              </Sheet.Footer>
            </form>
          </Form>
        </Sheet.View>
      </Sheet>
    </div>
  );
};
