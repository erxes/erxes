import { Form, Input, Textarea } from 'erxes-ui';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectLoyaltyAccountType } from '../../../account-type/components/SelectLoyaltyAccountType';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { ScoreCampaignActionTabs } from './ScoreCampaignActionTabs';

export const ScoreCampaignGeneralSection = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');
  const legacyDefaultScore =
    useWatch({ control: form.control, name: 'legacyDefaultScore' }) ?? false;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[1fr_120px] gap-4">
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title')}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder={t('enter-title')} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="order"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('order')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('description')}</Form.Label>
            <Form.Control>
              <Textarea
                {...field}
                placeholder={t('enter-description')}
                className="min-h-[80px]"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <Form.Field
          control={form.control}
          name="accountTypeId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('loyalty-account-type')}</Form.Label>
              <SelectLoyaltyAccountType
                value={field.value || ''}
                onValueChange={field.onChange}
                allowDefaultScore={legacyDefaultScore}
              />
              <Form.Description>
                {t('loyalty-account-type-campaign-hint')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <ScoreCampaignActionTabs form={form} />
    </div>
  );
};
