import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectVoucherCampaign } from '../../../components/selects/SelectVoucherCampaign';
import { SpinFormValues } from '../../../constants/spinFormSchema';

interface SpinAddCampaignCoreFieldsProps {
  form: UseFormReturn<SpinFormValues>;
}

export const SpinAddCampaignCoreFields: React.FC<
  SpinAddCampaignCoreFieldsProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'awards',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title')}</Form.Label>
              <Form.Control>
                <Input placeholder={t('enter-spin-title')} {...field} />
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
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div className="flex gap-4 items-end w-full" key={field.id}>
              <div className="grid grid-cols-3 gap-4">
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
                  name={`awards.${index}.probability`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('probability')}</Form.Label>
                      <Form.Control>
                        <Input
                          type="number"
                          placeholder={t('probability')}
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
              probability: 0,
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
