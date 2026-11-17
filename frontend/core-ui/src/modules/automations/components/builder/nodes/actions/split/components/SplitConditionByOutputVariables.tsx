import { useTranslation } from 'react-i18next';
import {
  useOutputVariableConditionRow,
  useSplitConditionByOutputVariables,
} from '@/automations/components/builder/nodes/actions/split/hooks/useSplitConditionByOutputVariables';
import { TSplitConditionsConfigForm } from '@/automations/components/builder/nodes/actions/split/states/splitConditionsConfigForm';
import { TOutputVariableField } from '@/automations/components/builder/nodes/actions/split/utils/splitOutputVariableConditions';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, DatePicker, Form, Input, Label, Select } from 'erxes-ui';
import { ControllerRenderProps } from 'react-hook-form';

type TConditionValueField = ControllerRenderProps<
  TSplitConditionsConfigForm,
  `options.${number}.config.conditions.${number}.propertyValue`
>;

export const SplitConditionByOutputVariables = ({
  contentType,
  optionIndex,
  outputVariables,
}: {
  contentType: string;
  optionIndex: number;
  outputVariables?: unknown;
}) => {
  const { t } = useTranslation('automations');
  const {
    control,
    conditionsConjunctionPath,
    fields,
    showConjunction,
    outputFields,
    addCondition,
    removeCondition,
  } = useSplitConditionByOutputVariables({
    contentType,
    optionIndex,
    outputVariables,
  });

  return (
    <div className="p-3">
      <div className="rounded-md bg-accent">
        <div className="grid grid-cols-[2fr_1fr_2fr_auto] items-center gap-2 px-4 py-2">
          <Label>{t('split-property')}</Label>
          <Label>{t('split-condition')}</Label>
          <Label>{t('value')}</Label>
          <div />
        </div>
        <div className="m-1 rounded-md bg-background p-2">
          {showConjunction && (
            <Form.Field
              control={control}
              name={conditionsConjunctionPath}
              render={({ field }) => (
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">
                    {t('split-match')}
                  </span>
                  <Select
                    value={field.value || 'and'}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger className="h-8 w-24">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="and">
                        {t('split-match-all')}
                      </Select.Item>
                      <Select.Item value="or">
                        {t('split-match-any')}
                      </Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              )}
            />
          )}
          <div className="flex flex-col gap-2">
            {fields.map((field, conditionIndex) => (
              <OutputVariableConditionRow
                key={field.id}
                contentType={contentType}
                optionIndex={optionIndex}
                conditionIndex={conditionIndex}
                outputFields={outputFields}
                onRemove={removeCondition}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-2 w-full font-mono text-xs font-semibold uppercase text-accent-foreground"
            onClick={addCondition}
          >
            <IconPlus />
            {t('split-add-condition')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const OutputVariableConditionRow = ({
  contentType,
  optionIndex,
  conditionIndex,
  outputFields,
  onRemove,
}: {
  contentType: string;
  optionIndex: number;
  conditionIndex: number;
  outputFields: TOutputVariableField[];
  onRemove: (index: number) => void;
}) => {
  const { t } = useTranslation('automations');
  const {
    control,
    conditionPath,
    selectedField,
    operators,
    valueDisabled,
    onPropertyChange,
    onOperatorChange,
  } = useOutputVariableConditionRow({
    contentType,
    optionIndex,
    conditionIndex,
    outputFields,
  });

  return (
    <div className="grid grid-cols-[2fr_1fr_2fr_auto] items-start gap-2">
      <Form.Field
        control={control}
        name={`${conditionPath}.propertyName`}
        render={({ field }) => (
          <Form.Item className="min-w-0">
            <Select
              value={field.value}
              onValueChange={onPropertyChange(field.onChange)}
            >
              <Select.Trigger className="w-full min-w-0">
                <Select.Value placeholder={t('split-select-field')} />
              </Select.Trigger>
              <Select.Content>
                {outputFields.map(({ name, label }) => (
                  <Select.Item key={name} value={name}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={`${conditionPath}.propertyOperator`}
        render={({ field }) => (
          <Form.Item className="min-w-0">
            <Select
              value={field.value}
              disabled={!selectedField}
              onValueChange={onOperatorChange(field.onChange)}
            >
              <Select.Trigger className="w-full min-w-0">
                <Select.Value placeholder={t('split-select-operator')} />
              </Select.Trigger>
              <Select.Content>
                {operators.map(({ value, labelKey }) => (
                  <Select.Item key={value} value={value}>
                    {t(labelKey)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={`${conditionPath}.propertyValue`}
        render={({ field }) => (
          <Form.Item className="min-w-0">
            <OutputVariableConditionValueInput
              field={field}
              selectedField={selectedField}
              disabled={valueDisabled}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-destructive"
        onClick={() => onRemove(conditionIndex)}
      >
        <IconTrash className="size-4" />
      </Button>
    </div>
  );
};

const OutputVariableConditionValueInput = ({
  field,
  selectedField,
  disabled,
}: {
  field: TConditionValueField;
  selectedField?: TOutputVariableField;
  disabled: boolean;
}) => {
  const { t } = useTranslation('automations');

  if (disabled) {
    return <Input className="w-full min-w-0" disabled />;
  }

  if (selectedField?.type === 'date') {
    return (
      <DatePicker
        className="w-full"
        value={field.value}
        onChange={field.onChange}
        placeholder={t('split-select-date')}
      />
    );
  }

  if (selectedField?.options?.length) {
    return (
      <Select value={field.value} onValueChange={field.onChange}>
        <Select.Trigger className="w-full min-w-0">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {selectedField.options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  return <Input {...field} className="w-full min-w-0" />;
};
