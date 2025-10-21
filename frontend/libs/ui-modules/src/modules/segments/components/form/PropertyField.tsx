import { Form, Select } from 'erxes-ui';

import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { IPropertyField } from '../../types';
import { groupFieldsByType } from '../../utils/segmentFormUtils';
import { FieldWithError } from '../FieldWithError';

export const PropertyField = ({
  fields,
  parentFieldName,
  defaultValue,
  propertyTypes,
}: IPropertyField) => {
  const { form, contentType } = useSegment();
  const { control } = form;
  const groups = groupFieldsByType(fields);
  return (
    <div className="flex flex-row w-full">
      <Form.Field
        control={control}
        name={`${parentFieldName}.propertyType`}
        defaultValue={contentType || undefined}
        render={({ field, fieldState }) => (
          <FieldWithError error={fieldState.error}>
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <Select.Trigger className="w-2/6 rounded-l-lg border-r-none">
                <Select.Value placeholder="Select an field" />
              </Select.Trigger>
              <Select.Content>
                {propertyTypes.map(
                  ({ value, description }: any, index: number) => (
                    <Select.Item key={index} value={value}>
                      {description}
                    </Select.Item>
                  ),
                )}
              </Select.Content>
            </Select>
          </FieldWithError>
        )}
      />
      <Form.Field
        control={control}
        name={`${parentFieldName}.propertyName`}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <FieldWithError error={fieldState.error}>
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <Select.Trigger className="w-4/6 rounded-r-lg border-l-none">
                <Select.Value placeholder="Select an field" />
              </Select.Trigger>
              <Select.Content>
                {Object.keys(groups).map((key, index) => {
                  let groupName = key;
                  const groupDetail = (groups[key] || []).find(
                    ({ group }: any) => group === key,
                  )?.groupDetail;

                  if (groupDetail) {
                    groupName = groupDetail?.name || key;
                  }
                  return (
                    <div key={index}>
                      <Select.Group>
                        <Select.Label>{groupName}</Select.Label>
                        {groups[key].map(
                          ({ name, label }: any, index: number) => (
                            <Select.Item key={index} value={name}>
                              {label}
                            </Select.Item>
                          ),
                        )}
                      </Select.Group>
                      <Select.Separator />
                    </div>
                  );
                })}
              </Select.Content>
            </Select>
          </FieldWithError>
        )}
      />
    </div>
  );
};
