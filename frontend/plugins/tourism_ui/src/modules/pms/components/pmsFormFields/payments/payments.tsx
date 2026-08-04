import { Control, useFieldArray } from 'react-hook-form';
import { Button, Form, Input, InfoCard } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { PmsBranchFormType } from '@/pms/constants/formSchema';
import { SelectPayment } from '@/pms/components/payment/SelectPayment';

const Payments = ({ control }: { control: Control<PmsBranchFormType> }) => {
  const { t } = useTranslation('tourism');
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otherPayments',
  });

  return (
    <PmsFormFieldsLayout>
      <div className="space-y-3">
        <InfoCard title={t('payments-title')}>
          <InfoCard.Content>
            <Form.Field
              control={control}
              name="paymentIds"
              render={({ field }) => (
                <Form.Item className="flex flex-col">
                  <Form.Label>{t('payments-title')}</Form.Label>

                  <Form.Control>
                    <SelectPayment.FormItem
                      mode="multiple"
                      value={field.value || []}
                      onValueChange={(value) => {
                        field.onChange(Array.isArray(value) ? value : []);
                      }}
                      placeholder={t('choose-payments')}
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name="erxesAppToken"
              render={({ field }) => (
                <Form.Item className="flex flex-col">
                  <Form.Label>{t('erxes-app-token')}</Form.Label>

                  <Form.Control>
                    <Input {...field} placeholder={t('enter-erxes-app-token')} />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title={t('other-payments')}>
          <InfoCard.Content>
            <p className="text-sm text-muted-foreground">
              {t('other-payments-desc')}
            </p>

            <Button className="w-fit" type="button" onClick={() => append({})}>
              <IconPlus /> {t('add-payments-method')}
            </Button>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-6 items-end">
                <div className="grid grid-cols-3 gap-6 w-full">
                  <Form.Field
                    control={control}
                    name={`otherPayments.${index}.type`}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('type')}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name={`otherPayments.${index}.title`}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('title')}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name={`otherPayments.${index}.config`}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('config')}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  type="button"
                  className="w-8 h-8"
                  aria-label={`Remove payment method ${index + 1}`}
                  title={t('remove-payment-method')}
                  onClick={() => remove(index)}
                >
                  <IconTrash />
                </Button>
              </div>
            ))}
          </InfoCard.Content>
        </InfoCard>
      </div>
    </PmsFormFieldsLayout>
  );
};

export default Payments;
