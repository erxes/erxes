import { gql } from '@apollo/client';
import { DatePicker, Form, Input, Select, TPropertyInputMeta } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { FieldPath } from 'react-hook-form';
import { pluginsConfigState } from 'ui-modules/states';
import { useSegment } from '../../context/SegmentProvider';
import {
  TNodePath,
  TSegmentField,
  TSegmentForm,
  TSegmentOperator,
} from '../../types';
import { useSegmentNodeValue } from '../../hooks/useSegmentNodeValue';
import { FieldWithError } from '../FieldWithError';
import { QuerySelectInput } from '../QuerySelectInput';

const listQuery = (name: string, labelField: string, valueField: string) => gql`
  query ${name}($searchValue: String, $direction: CURSOR_DIRECTION, $cursor: String, $limit: Int) {
    ${name}(searchValue: $searchValue, direction: $direction, cursor: $cursor, limit: $limit) {
      list { ${labelField} ${valueField} }
      totalCount
      pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
    }
  }
`;

const onlyStrings = (meta: TPropertyInputMeta): Record<string, string> =>
  Object.fromEntries(
    Object.entries(meta).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );

export const SegmentConditionValue = ({
  path,
  field: declared,
  fieldType,
  operator,
}: {
  path: TNodePath;
  field?: TSegmentField;
  fieldType?: string;
  operator?: TSegmentOperator;
}) => {
  const { form, contentType, stats } = useSegment();
  const { countSettled } = stats;
  const pluginsConfig = useAtomValue(pluginsConfigState);

  const name = `${path}.value` as FieldPath<TSegmentForm>;
  const metaName = `${path}.meta`;
  const meta = useSegmentNodeValue<Record<string, string>>(metaName);

  if (!declared || !operator || operator.input === 'none') {
    return null;
  }

  const asNumber = operator.input === 'number';

  const [pluginName] = (fieldType || contentType).split(':');
  const CustomInput =
    declared.source === 'component' && declared.component
      ? Object.values(pluginsConfig || {}).find(
          (config) => config.name === pluginName,
        )?.widgets?.propertyInputs?.[declared.component]
      : undefined;

  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const value = typeof field.value === 'string' ? field.value : '';

        return (
          <FieldWithError error={fieldState.error}>
            <div className="w-full min-w-0">
              {asNumber ? (
                <Input
                  type="number"
                  value={value}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={countSettled}
                  className="w-full min-w-0"
                />
              ) : CustomInput ? (
                <CustomInput
                  value={value}
                  meta={meta}
                  onValueChange={(next: unknown) => {
                    field.onChange(next);
                    countSettled();
                  }}
                  onMetaChange={(next: TPropertyInputMeta) =>
                    form.setValue(
                      metaName as FieldPath<TSegmentForm>,
                      onlyStrings(next),
                      { shouldDirty: true },
                    )
                  }
                />
              ) : declared.input === 'date' ? (
                <DatePicker
                  className="w-full"
                  value={field.value as Date | undefined}
                  onChange={(date) => {
                    field.onChange(date);
                    countSettled();
                  }}
                  placeholder="Select date"
                />
              ) : declared.input === 'select' &&
                declared.source === 'static' ? (
                <Select
                  value={value}
                  onValueChange={(next) => {
                    field.onChange(next);
                    countSettled();
                  }}
                >
                  <Select.Trigger className="w-full min-w-0">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {(declared.options || []).map(
                      (option: { value: string; label: string }) => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ),
                    )}
                  </Select.Content>
                </Select>
              ) : declared.input === 'select' && declared.query ? (
                <QuerySelectInput
                  query={listQuery(
                    declared.query.name,
                    declared.query.labelField,
                    declared.query.valueField || '_id',
                  )}
                  queryName={declared.query.name}
                  labelField={declared.query.labelField}
                  valueField={declared.query.valueField || '_id'}
                  nullable
                  value={value}
                  onSelect={(next) => {
                    field.onChange(next);
                    countSettled();
                  }}
                  focusOnMount
                />
              ) : (
                <Input
                  type={declared.input === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={countSettled}
                  className="w-full min-w-0"
                />
              )}
            </div>
          </FieldWithError>
        );
      }}
    />
  );
};
