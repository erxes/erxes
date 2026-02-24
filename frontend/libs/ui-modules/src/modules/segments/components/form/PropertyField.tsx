import { Form, Select } from 'erxes-ui';

import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { IPropertyField } from '../../types';
import { groupFieldsByType } from '../../utils/segmentFormUtils';
import { FieldWithError } from '../FieldWithError';

export const PropertyField = ({
  fields,
  parentFieldName,
  propertyTypes,
  loading,
}: IPropertyField) => {
  const { form } = useSegment();
  const { control } = form;
  const fieldsGroupsMap = groupFieldsByType(fields);
  return (
    <div className="flex flex-row w-full shadow-xs rounded-lg">
      <Form.Field
        control={control}
        name={`${parentFieldName}.propertyType`}
        render={({ field, fieldState }) => (
          <FieldWithError error={fieldState.error}>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
              }}
              disabled={loading}
            >
              <Select.Trigger className="w-2/6 rounded-r-none border-r border-border/80 shadow-none">
                <Select.Value placeholder="Select an field" />
              </Select.Trigger>
              <Select.Content>
                {propertyTypes.map(
                  ({ value, description }: any, index: number) => (
                    <Select.Item
                      key={index}
                      value={value}
                      className="[&_svg]:text-primary"
                    >
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
        render={({ field, fieldState }) => (
          <FieldWithError error={fieldState.error}>
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <Select.Trigger className="w-4/6 rounded-l-none shadow-none">
                <Select.Value placeholder="Select an field" />
              </Select.Trigger>
              <Select.Content>
                {Object.keys(fieldsGroupsMap).map((key, index) => {
                  let groupName = key;
                  const groupDetail = (fieldsGroupsMap[key] || []).find(
                    ({ group }: any) => group === key,
                  )?.groupDetail;

                  if (groupDetail) {
                    groupName = groupDetail?.name || key;
                  }
                  return (
                    <div key={index}>
                      <Select.Group>
                        <Select.Label>{groupName}</Select.Label>
                        {fieldsGroupsMap[key].map(
                          ({ name, label }: any, index: number) => (
                            <Select.Item
                              key={index}
                              value={name}
                              className="[&_svg]:text-primary"
                            >
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
