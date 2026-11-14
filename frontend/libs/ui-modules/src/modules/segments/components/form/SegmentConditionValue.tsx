import { DatePicker, Form, Input, Select } from 'erxes-ui';
import { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSegmentConditionValue } from '../../hooks/useSegmentConditionValue';
import {
  TNodePath,
  TSegmentField,
  TSegmentForm,
  TSegmentOperator,
} from '../../types';
import {
  segmentDateValue,
  segmentTextValue,
} from '../../utils/segmentConditionValue';
import { FieldWithError } from '../FieldWithError';
import { QuerySelectInput } from '../QuerySelectInput';

type TValueInputState = ReturnType<typeof useSegmentConditionValue>;

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
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const state = useSegmentConditionValue({
    path,
    field: declared,
    fieldType,
    operator,
  });

  if (!state.kind) {
    return <Input disabled placeholder={t('value')} className="w-full" />;
  }

  if (state.kind === 'none') {
    return null;
  }

  return (
    <Form.Field
      control={state.control}
      name={state.name}
      render={({ field, fieldState }) => (
        <FieldWithError error={fieldState.error}>
          <div className="w-full min-w-0">
            <SegmentValueInput state={state} field={field} />
          </div>
        </FieldWithError>
      )}
    />
  );
};

const SegmentValueInput = ({
  state,
  field,
}: {
  state: TValueInputState;
  field: ControllerRenderProps<TSegmentForm>;
}) => {
  const { kind, CustomInput, query, commit, typed, countSettled } = state;
  const value = segmentTextValue(field.value);

  if (kind === 'custom' && CustomInput) {
    return (
      <CustomInput
        value={value}
        meta={state.meta}
        onValueChange={commit(field.onChange)}
        onMetaChange={state.changeMeta}
      />
    );
  }

  if (kind === 'date') {
    return (
      <DatePicker
        className="w-full"
        value={segmentDateValue(field.value)}
        onChange={commit(field.onChange)}
        placeholder="Select date"
      />
    );
  }

  if (kind === 'static') {
    return (
      <Select value={value} onValueChange={commit(field.onChange)}>
        <Select.Trigger className="w-full min-w-0">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {state.staticOptions.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  if (kind === 'query' && query) {
    return (
      <QuerySelectInput
        query={query.document}
        variables={query.variables}
        queryName={query.name}
        labelField={query.labelField}
        valueField={query.valueField}
        nullable
        value={value}
        onSelect={commit(field.onChange)}
        focusOnMount
      />
    );
  }

  return (
    <Input
      type={kind === 'number' ? 'number' : state.textType}
      value={value}
      onChange={typed(field.onChange)}
      onBlur={countSettled}
      className="w-full min-w-0"
    />
  );
};
