import { UseFormReturn } from 'react-hook-form';
import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { useFieldGroups } from 'ui-modules/modules/properties/hooks/useFieldGroups';
import { useFields } from 'ui-modules/modules/properties/hooks/useFields';
import { IFieldGroup } from 'ui-modules/modules/properties/types/fieldsTypes';

import { getMSDynamicFieldLabel, TMSDynamicConfig } from '../../types';

type PropertyFieldName = 'custCode' | 'userLocationCode';

type Props = {
  form: UseFormReturn<TMSDynamicConfig>;
  name: PropertyFieldName;
  loading?: boolean;
};

export const MSDynamicPropertyField = ({
  form,
  name,
  loading,
}: Props) => {
  const { t } = useTranslation('mongolian');

  const { fieldGroups = [] } = useFieldGroups({
    contentType: 'core:user',
  });

  const groupId = form.watch(`${name}.groupId`);

  const { fields = [] } = useFields({
    contentType: 'core:user',
    groupId,
  });

  return (
    <Form.Item>
      <Form.Label>{t(getMSDynamicFieldLabel(name))}</Form.Label>

      <div className="space-y-3">
        <Form.Field
          control={form.control}
          name={`${name}.groupId`}
          render={({ field }) => (
            <Form.Control>
              <select
                value={field.value || ''}
                disabled={loading}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  form.setValue(`${name}.fieldId`, '');
                }}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="">Select property group</option>

                {fieldGroups.map((group: IFieldGroup) => (
                  <option key={group._id} value={group._id}>
                    {group.code} - {group.name}
                  </option>
                ))}
              </select>
            </Form.Control>
          )}
        />

        <Form.Field
          control={form.control}
          name={`${name}.fieldId`}
          render={({ field }) => (
            <Form.Control>
              <select
                value={field.value || ''}
                disabled={loading || !groupId}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="">Select property</option>

                {fields.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>
            </Form.Control>
          )}
        />
      </div>

      <Form.Message />
    </Form.Item>
  );
};