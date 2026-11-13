import {
  IntegrationNameField,
  IntegrationBrandField,
} from '@/integrations/components/IntegrationFormFields';
import {
  PanelFormLayout,
  useSidePanel,
  PanelFormRow,
  PANEL_INPUT_CLASS_NAME,
  SelectMember,
} from 'ui-modules';

import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CALL_INTEGRATION_FORM_SCHEMA } from '@/integrations/call/constants/callIntegrationAddSchema';
import { z } from 'zod';

export const CallIntegrationForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>>;
  onSubmit: (data: z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>) => void;
  loading?: boolean;
}) => {
  const { close } = useSidePanel();
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
        <PanelFormLayout onCancel={close} saving={loading}>
          <IntegrationNameField />
          <Form.Field
            name="phone"
            render={({ field }) => (
              <Form.Item>
                <PanelFormRow label={t('phone-number')}>
                  <Form.Control>
                    <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
                  </Form.Control>
                  <Form.Message />
                </PanelFormRow>
              </Form.Item>
            )}
          />
          <Form.Field
            name="websocketServer"
            render={({ field }) => (
              <Form.Item>
                <PanelFormRow label={t('websocket-server')}>
                  <Form.Control>
                    <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
                  </Form.Control>
                  <Form.Message />
                </PanelFormRow>
              </Form.Item>
            )}
          />
          <IntegrationBrandField required />
          <Form.Field
            name="queues"
            render={({ field }) => (
              <Form.Item>
                <PanelFormRow label={t('queues')}>
                  <Form.Control>
                    <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
                  </Form.Control>
                  <Form.Message />
                </PanelFormRow>
              </Form.Item>
            )}
          />

          <Form.Field
            name="srcTrunk"
            render={({ field }) => (
              <Form.Item>
                <PanelFormRow label={t('source-trunk')}>
                  <Form.Control>
                    <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
                  </Form.Control>
                  <Form.Message />
                </PanelFormRow>
              </Form.Item>
            )}
          />
          <Form.Field
            name="dstTrunk"
            render={({ field }) => (
              <Form.Item>
                <PanelFormRow label={t('destination-trunk')}>
                  <Form.Control>
                    <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
                  </Form.Control>
                  <Form.Message />
                </PanelFormRow>
              </Form.Item>
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
                        <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
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
                        <Input {...field} className={PANEL_INPUT_CLASS_NAME} />
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
        </PanelFormLayout>
      </form>
    </Form>
  );
};
