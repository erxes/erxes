import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectVoucherCampaign } from '../../../components/selects/SelectVoucherCampaign';
import { DonationFormValues } from '../../../constants/donationFormSchema';

interface DonationAddCampaignCoreFieldsProps {
  form: UseFormReturn<DonationFormValues>;
}

export const DonationAddCampaignCoreFields: React.FC<
  DonationAddCampaignCoreFieldsProps
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
                <Input placeholder={t('enter-donation-title')} {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="maxScore"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('max-score')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-max-score')}
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
              <div className="flex-1 min-w-0">
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
              </div>
              <div className="w-full sm:w-60">
                <Form.Field
                  control={form.control}
                  name={`awards.${index}.minScore`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('min-score')}</Form.Label>
                      <Form.Control>
                        <Input
                          type="number"
                          placeholder={t('score')}
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
          onClick={() => append({ minScore: 0, voucherCampaignId: '' })}
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
