import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import React, { useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectVoucherCampaign } from '../../../components/selects/SelectVoucherCampaign';
import { LotteryFormValues } from '../../../constants/lotteryFormSchema';
import { SelectFormatNumber } from '../../../components/selects/SelectFormatNumber';

interface LotteryAddCampaignCoreFieldsProps {
  form: UseFormReturn<LotteryFormValues>;
}

export const LotteryAddCampaignCoreFields: React.FC<
  LotteryAddCampaignCoreFieldsProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'awards',
  });

  const [formatType, setFormatType] = useState('');
  const [formatCount, setFormatCount] = useState(6);

  const handleAddFormat = () => {
    if (!formatType) return;
    const current = form.getValues('numberFormat') || '';
    const newPart = `{ ${formatType} * ${formatCount} }`;
    form.setValue('numberFormat', current + newPart);
  };

  return (
    <div className="space-y-2">
      <Form.Field
        control={form.control}
        name="title"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('title')}</Form.Label>
            <Form.Control>
              <Input placeholder={t('enter-lottery-title')} {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={`buyScore`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('buy-score')}</Form.Label>
            <Form.Control>
              <Input
                type="number"
                placeholder={t('enter-buy-score')}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <div className="space-y-4">
        <Form.Label>{t('number-format')}</Form.Label>
        <div className="flex gap-2 items-center">
          <SelectFormatNumber.FormItem
            value={formatType}
            placeholder={t('choose-allow-chars')}
            onValueChange={(value) => setFormatType(value)}
            className="w-62"
          />

          <Form.Item>
            <Form.Control>
              <Input
                className="w-62"
                type="number"
                value={formatCount}
                onChange={(e) => setFormatCount(Number(e.target.value))}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>

          <Button
            className="h-8 w-52"
            type="button"
            variant="outline"
            size="default"
            onClick={handleAddFormat}
            disabled={!formatType}
          >
            <IconPlus />
            {t('add-format')}
          </Button>
        </div>
        <Form.Field
          control={form.control}
          name="numberFormat"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  readOnly
                  placeholder={t('format-preview')}
                  {...field}
                  value={field.value || ''}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div className="flex gap-4 items-end w-full" key={field.id}>
              <div className="grid grid-cols-3 gap-4 ">
                <Form.Field
                  control={form.control}
                  name={`awards.${index}.name`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('name')}</Form.Label>
                      <Form.Control>
                        <Input placeholder={t('enter-name')} {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name={`awards.${index}.voucherCampaignId`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('voucher-campaign')}</Form.Label>
                      <Form.Control>
                        <SelectVoucherCampaign
                          value={field.value || undefined}
                          onValueChange={(id) => field.onChange(id)}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name={`awards.${index}.count`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('count')}</Form.Label>
                      <Form.Control>
                        <Input
                          type="number"
                          placeholder={t('count')}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>

              <Button
                onClick={() => remove(index)}
                variant="secondary"
                size="icon"
                className="size-8 bg-destructive/10 hover:bg-destructive/20 text-destructive"
              >
                <IconTrash />
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={() =>
            append({
              name: '',
              count: 0,
              voucherCampaignId: '',
            })
          }
          className="flex w-full mt-5!"
          variant="secondary"
        >
          <IconPlus />
          {t('add-level')}
        </Button>
      </div>
    </div>
  );
};
