import { FormType } from '@/settings/profile/hooks/useProfileForm';
import { Form } from 'erxes-ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SelectPositions } from 'ui-modules';

export const PositionField = () => {
  const form = useFormContext<FormType>();

  return (
    <fieldset className="col-span-2">
      <Form.Field
        control={form.control}
        name="positionIds"
        render={({ field }) => (
          <Form.Item className='flex flex-col space-y-2'>
            <Form.Label>Positions</Form.Label>
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
