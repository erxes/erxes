import { IconInfoCircle } from '@tabler/icons-react';
import { Alert, Button, Form, Input, Sheet, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SelectBrand } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { CALL_PRO_INTEGRATION_FORM_SCHEMA } from '@/integrations/callpro/constants/callProIntegrationSchema';
import { callProEditSheetAtom } from '@/integrations/callpro/states/callProEditSheetAtom';
import { useCallProConfig } from '@/integrations/callpro/hooks/useCallProConfig';

export const CallProIntegrationForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>>;
  onSubmit: (data: z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>) => void;
  loading?: boolean;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-auto overflow-hidden"
      >
        <CallProIntegrationFormLayout
          actions={
            <Button type="submit" disabled={loading}>
              {loading && <Spinner size="sm" />}
              {t('save')}
            </Button>
          }
        >
          <CallProWebhookHint />
          <Form.Field
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('name')}</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="phoneNumber"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('phone-number')}</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="recordUrl"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('callpro-record-url')}</Form.Label>
                <Form.Control>
                  <Input {...field} value={field.value ?? ''} />
                </Form.Control>
                <Form.Description>
                  {t('callpro-record-url-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="brandId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('brand')} <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <SelectBrand
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('select-a-brand')}
                    className="w-full"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </CallProIntegrationFormLayout>
      </form>
    </Form>
  );
};

export const CallProWebhookHint = () => {
  const { t } = useTranslation('frontline');
  const { webhookUrl } = useCallProConfig();

  if (!webhookUrl) {
    return null;
  }

  return (
    <Alert className="col-span-2">
      <IconInfoCircle className="size-4" />
      <Alert.Title>{t('callpro-webhook-title')}</Alert.Title>
      <Alert.Description>
        {t('callpro-webhook-description')}
        <code className="mt-1 block break-all font-mono text-xs">
          {webhookUrl}
        </code>
      </Alert.Description>
    </Alert>
  );
};

export const CallProIntegrationFormLayout = ({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const callProEditSheet = useAtomValue(callProEditSheetAtom);

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>
          {callProEditSheet ? t('callpro-edit') : t('callpro-add')}
        </Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="overflow-auto p-4 styled-scroll">
        <div className="grid grid-cols-2 gap-4">{children}</div>
      </Sheet.Content>
      <Sheet.Footer>
        <Sheet.Close asChild>
          <Button className="mr-auto text-muted-foreground" variant="ghost">
            {t('cancel')}
          </Button>
        </Sheet.Close>
        {actions}
      </Sheet.Footer>
    </>
  );
};
