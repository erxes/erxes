import { FormType } from '@/settings/profile/hooks/useProfileForm';
import { Form } from 'erxes-ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SelectPositions } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const PositionField = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'profile',
  });
  const form = useFormContext<FormType>();

  return (
    <fieldset className="col-span-2">
      <Form.Field
        control={form.control}
        name="positionIds"
        render={({ field }) => (
          <Form.Item className="flex flex-col space-y-2">
            <Form.Label>{t('position')}</Form.Label>
            <Form.Control>
              <SelectPositions.Detail
                value={field.value}
                mode="multiple"
                onValueChange={field.onChange}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </fieldset>
  );
};
