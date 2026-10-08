import { Form, Input, Select } from 'erxes-ui';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TLoyaltyAccountTypeFormValues } from '../hooks/useLoyaltyAccountTypeForm';
import { LOYALTY_ACCOUNT_TYPE_OWNER_TYPES } from '../types';
import { SelectSegment } from '../../assignment/add-assignment-campaign/components/selects/SelectSegment';

// A wallet's owners as segments name them, old and new type names alike.
const SEGMENT_CONTENT_TYPES: Record<string, string[]> = {
  customer: ['core:contacts.customers', 'core:customer'],
  company: ['core:contacts.companies', 'core:company'],
  user: ['core:organization.users', 'core:user'],
};

// `control` is passed in: the plugin's react-hook-form copy cannot read the
// context erxes-ui's Form provides.
export const LoyaltyAccountTypeGeneralSection = ({
  control,
  isEdit,
}: {
  control: Control<TLoyaltyAccountTypeFormValues>;
  isEdit: boolean;
}) => {
  const { t } = useTranslation('loyalty');
  const [ownerType, who] = useWatch({
    control,
    name: ['ownerType', 'earnEligibility.who'],
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t('loyalty-account-type-description')}
      </p>
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control>
              <Input
                {...field}
                placeholder={t('loyalty-account-type-name-placeholder')}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="ownerType"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('apply-score-to')}</Form.Label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isEdit}
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {LOYALTY_ACCOUNT_TYPE_OWNER_TYPES.map(({ value, label }) => (
                  <Select.Item key={value} value={value}>
                    {t(label)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Description>
              {t('loyalty-account-type-owner-type-hint')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="frozenBlocks"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('loyalty-frozen-blocks')}</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                <Select.Item value="spending">
                  {t('loyalty-frozen-blocks-spending')}
                </Select.Item>
                <Select.Item value="all">
                  {t('loyalty-frozen-blocks-all')}
                </Select.Item>
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="earnEligibility.who"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('loyalty-earn-eligibility')}</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                <Select.Item value="all">
                  {t('loyalty-earn-eligibility-all')}
                </Select.Item>
                {ownerType === 'customer' && (
                  <Select.Item value="clientPortal">
                    {t('loyalty-earn-eligibility-client-portal')}
                  </Select.Item>
                )}
                <Select.Item value="segment">
                  {t('loyalty-earn-eligibility-segment')}
                </Select.Item>
              </Select.Content>
            </Select>
            <Form.Description>
              {t('loyalty-earn-eligibility-hint')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
      {who === 'segment' && (
        <Form.Field
          control={control}
          name="earnEligibility.segmentId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('segment')}</Form.Label>
              <SelectSegment
                value={field.value || ''}
                onValueChange={field.onChange}
                contentTypes={SEGMENT_CONTENT_TYPES[ownerType]}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};
