import { IntegrationFormItem } from '@/integrations/components/IntegrationPanelForm';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Sheet, Form, Input, Spinner } from 'erxes-ui';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CALL_INTEGRATION_FORM_SCHEMA } from '@/integrations/call/constants/callIntegrationAddSchema';
import { z } from 'zod';
import { SelectMember, SelectBrand } from 'ui-modules';

export const CallIntegrationForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>>;
  onSubmit: (data: z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>) => void;
  loading?: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'operators',
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-auto overflow-hidden"
      >
        <CallIntegrationFormLayout
          actions={
            <Button
              type="submit"
              onClick={() => form.handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading && <Spinner size="sm" />}
              {t('save')}
            </Button>
          }
        >
          <Form.Field
            name="name"
            render={({ field }) => (
              <IntegrationFormItem label={t('name')}>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="phone"
            render={({ field }) => (
              <IntegrationFormItem label={t('phone-number')}>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="websocketServer"
            render={({ field }) => (
              <IntegrationFormItem label={t('websocket-server')}>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="brandId"
            render={({ field }) => (
              <IntegrationFormItem
                label={
                  <>
                    {t('brand')} <span className="text-destructive">*</span>
                  </>
                }
              >
                <Form.Control>
                  <SelectBrand
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('select-a-brand')}
                    className="w-full"
                  />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="queues"
            render={({ field }) => (
              <IntegrationFormItem label={t('queues')}>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />

          <Form.Field
            name="srcTrunk"
            render={({ field }) => (
              <IntegrationFormItem label={t('source-trunk')}>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="dstTrunk"
            render={({ field }) => (
              <IntegrationFormItem label={t('destination-trunk')}>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <div className="font-medium">{t('operators')}</div>
          {fields.map((field, index) => (
            <div
              className="col-span-full border-b last-of-type:border-b-0 border-dashed pb-4 last-of-type:pb-0"
              key={field.id}
            >
              <div className="flex flex-col gap-3 w-full">
                <Form.Field
                  name={`operators.${index}.userId`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      <Form.Label>{t('operator')}</Form.Label>
                      <SelectMember.FormItem
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name={`operators.${index}.gsUsername`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      <Form.Label>{t('username')}</Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name={`operators.${index}.gsPassword`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      <Form.Label>{t('password')}</Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-destructive/20 text-destructive mt-6 size-8 hover:bg-destructive/30"
                  onClick={() => remove(index)}
                >
                  <IconTrash />
                </Button>
              </div>
            </div>
          ))}
          <Button
            className="col-span-full"
            variant="secondary"
            onClick={() =>
              append({
                userId: undefined,
                gsUsername: '',
                gsPassword: '',
              })
            }
          >
            <IconPlus />
            {t('add-operator')}
          </Button>
        </CallIntegrationFormLayout>
      </form>
    </Form>
  );
};

export const CallIntegrationFormLayout = ({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  return (
    <>
      <Sheet.Content className="min-h-0 overflow-auto p-3 styled-scroll">
        <div className="grid grid-cols-1 gap-3">{children}</div>
      </Sheet.Content>
      <Sheet.Footer className="h-auto min-h-12 shrink-0 border-t px-2 gap-1">
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
