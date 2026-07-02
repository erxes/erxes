'use client';

import { Button, Form, Input, Select } from 'erxes-ui';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';
import {
  Control,
  FieldArrayPath,
  FieldValues,
  Path,
  useFieldArray,
} from 'react-hook-form';
import PaymentIcon, {
  paymentIconOptions,
} from 'ui-modules/modules/payments/components/PaymentIcon';
import { useLoyaltyScoreCampaign } from 'ui-modules/modules/payments/hooks/useLoyaltyScoreCampaign';

type OtherPaymentsFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
};

export const OtherPaymentsField = <TFieldValues extends FieldValues>({
  control,
}: OtherPaymentsFieldProps<TFieldValues>) => {
  const { t } = useTranslation('sales');
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'paymentTypes' as FieldArrayPath<TFieldValues>,
  });

  const { scoreDetail } = useLoyaltyScoreCampaign({
    variables: { serviceName: 'sales' },
  });

  const handleAddPayment = () => {
    append({
      _id: nanoid(),
      type: '',
      title: '',
      icon: '',
      config: '',
      scoreCampaignId: '',
    });
  };

  const fieldPath = (index: number, key: string) =>
    `paymentTypes.${index}.${key}` as Path<TFieldValues>;

  return (
    <div className="py-3">
      <div className="flex flex-col gap-2 items-start self-stretch mb-4">
        <h2 className="self-stretch text-[#4F46E5] text-sm font-medium leading-tight">
          {t('other-payment')}
        </h2>

        <p className="text-[#71717A] font-['Inter'] text-xs font-medium leading-[140%]">
          {t('type-must-use-latin')}
          {' '}Хэрэв тухайн төлбөрт ебаримт хэвлэхгүй бол: &quot;skipEbarimt: true&quot;,
          Харилцагч сонгосон үед л харагдах бол: &quot;mustCustomer: true&quot;, Хэрэв
          хуваах боломжгүй бол: &quot;notSplit: true&quot; Урьдчилж төлсөн төлбөрөөр
          (Татвар тооцсон) бол: &quot;preTax: true&quot;, Тухайн төрөл нь QRCode
          шаардлагатай бол &quot;require&quot;: &quot;qrCode&quot;
        </p>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex gap-4 justify-between items-end px-4 mb-4 w-full"
        >
          <div className="flex-1">
            <Form.Field
              control={control}
              name={fieldPath(index, 'type')}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-xs text-gray-600">
                    {t('TYPE')}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      placeholder={t('enter-type')}
                      {...field}
                      value={field.value || ''}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
          <div className="flex-1">
            <Form.Field
              control={control}
              name={fieldPath(index, 'title')}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-xs text-gray-600">
                    {t('TITLE')}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      placeholder={t('enter-title')}
                      {...field}
                      value={field.value || ''}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
          <div className="flex-1">
            <Form.Field
              control={control}
              name={fieldPath(index, 'icon')}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-xs text-gray-600">
                    {t('ICON')}
                  </Form.Label>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger className="mb-0">
                      <Select.Value placeholder={t('select-option')}>
                        {field.value && (
                          <div className="flex gap-2 items-center">
                            <PaymentIcon iconType={field.value} size={16} />
                            {
                              paymentIconOptions.find(
                                (icon) => icon.value === field.value,
                              )?.label
                            }
                          </div>
                        )}
                      </Select.Value>
                    </Select.Trigger>
                    <Select.Content>
                      {paymentIconOptions.map((icon) => (
                        <Select.Item
                          key={icon.value}
                          className="text-xs"
                          value={icon.value}
                        >
                          <div className="flex gap-2 items-center">
                            <PaymentIcon iconType={icon.value} size={16} />
                            {icon.label}
                          </div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )}
            />
          </div>
          <div className="flex-1">
            <Form.Field
              control={control}
              name={fieldPath(index, 'config')}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-xs text-gray-600">
                    {t('CONFIG')}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      placeholder={t('enter-config')}
                      {...field}
                      value={field.value || ''}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
          <div className="flex-1">
            <Form.Field
              control={control}
              name={fieldPath(index, 'scoreCampaignId')}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-xs text-gray-600">
                    {t('score-campaign')}
                  </Form.Label>
                  <Form.Control>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger className="mb-0">
                        <Select.Value placeholder={t('score-campaigns')} />
                      </Select.Trigger>
                      <Select.Content>
                        {scoreDetail?.map((campaign) => (
                          <Select.Item key={campaign._id} value={campaign._id}>
                            {campaign.title}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
          <Button
            variant="ghost"
            className="px-2 h-8 text-destructive"
            type="button"
            onClick={() => remove(index)}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      ))}

      <div className="flex gap-2 justify-end items-center p-3">
        <Button
          variant="default"
          className="flex gap-2 items-center mb-6"
          onClick={handleAddPayment}
          type="button"
        >
          <IconPlus size={16} />
          {t('add-payment-method')}
        </Button>
      </div>
    </div>
  );
};
