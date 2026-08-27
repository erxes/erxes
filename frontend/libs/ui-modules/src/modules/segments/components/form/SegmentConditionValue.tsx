import { gql } from '@apollo/client';
import { DatePicker, Form, Input, Select } from 'erxes-ui';
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
import { FieldWithError } from '../FieldWithError';
import { QuerySelectInput } from '../QuerySelectInput';

/**
 * The value side of a condition.
 *
 * Which input to show is decided twice over: the operator says whether it wants
 * nothing, a plain number or the field's own input, and only then does the
 * field's declared input kind matter. That is why "3 days ago" shows a number
 * box on a date field.
 */

const listQuery = (name: string, labelField: string, valueField: string) => gql`
  query ${name}($searchValue: String, $direction: CURSOR_DIRECTION, $cursor: String, $limit: Int) {
    ${name}(searchValue: $searchValue, direction: $direction, cursor: $cursor, limit: $limit) {
      list { ${labelField} ${valueField} }
      totalCount
      pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
    }
  }
`;

export const SegmentConditionValue = ({
  path,
  field: declared,
  operator,
}: {
  path: TNodePath;
  field?: TSegmentField;
  operator?: TSegmentOperator;
}) => {
  const { form, contentType } = useSegment();
  const pluginsConfig = useAtomValue(pluginsConfigState);

  if (!declared || !operator || operator.input === 'none') {
    return null;
  }

  const name = `${path}.value` as FieldPath<TSegmentForm>;

  // The operator wants a count, whatever the field itself looks like.
  const asNumber = operator.input === 'number';

  const [pluginName] = contentType.split(':');
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
                  className="w-full min-w-0"
                />
              ) : CustomInput ? (
                <CustomInput
                  value={value}
                  onValueChange={field.onChange}
                  onMetaChange={() => undefined}
                />
              ) : declared.input === 'date' ? (
                <DatePicker
                  className="w-full"
                  value={field.value as Date | undefined}
                  onChange={(date) => field.onChange(date)}
                  placeholder="Select date"
                />
              ) : declared.input === 'select' &&
                declared.source === 'static' ? (
                <Select value={value} onValueChange={field.onChange}>
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
                  onSelect={field.onChange}
                  focusOnMount
                />
              ) : (
                <Input
                  type={declared.input === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(event) => field.onChange(event.target.value)}
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
