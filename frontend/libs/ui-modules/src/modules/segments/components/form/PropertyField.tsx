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
  onBeforeFieldChange,
}: IPropertyField) => {
  const { form } = useSegment();
  const { control } = form;
  const fieldsGroupsMap = groupFieldsByType(fields);
  return (
    <div className="flex flex-row w-full min-w-0 shadow-xs rounded-lg">
      <Form.Field
        control={control}
        name={`${parentFieldName}.propertyType`}
        render={({ field, fieldState }) => (
          <FieldWithError error={fieldState.error}>
            <Select
              value={field.value}
              onValueChange={(value) => {
                onBeforeFieldChange?.('propertyType');
                field.onChange(value);
              }}
              disabled={loading}
            >
              <Select.Trigger className="w-full min-w-0 max-w-32 rounded-r-none border-r border-border/80 shadow-none">
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
      <div className="min-w-0 flex-1">
        <Form.Field
          control={control}
          name={`${parentFieldName}.propertyName`}
          render={({ field, fieldState }) => (
            <FieldWithError error={fieldState.error}>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  onBeforeFieldChange?.('propertyName');
                  field.onChange(value);
                }}
              >
                <Select.Trigger className="w-full min-w-0 overflow-hidden rounded-l-none shadow-none [&>span]:truncate [&>span]:block [&>span]:min-w-0">
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
    </div>
  );
};
