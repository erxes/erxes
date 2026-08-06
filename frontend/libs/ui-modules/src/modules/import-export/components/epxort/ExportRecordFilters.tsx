import { IconPlus, IconX } from '@tabler/icons-react';
import {
  Button,
  cn,
  DatePicker,
  InfoCard,
  Input,
  InputNumber,
  Select,
  Switch,
} from 'erxes-ui';
import { OPERATOR_BY_TYPE } from '../../../properties/constants/field_operators';
import { PropertyFilterOperator } from '../../../properties/types/fieldsTypes';
import { SelectMember } from '../../../team-members';
import {
  TExportHeader,
  TRenderRelationValueInput,
  TSystemFieldCondition,
} from '../../types/export/exportTypes';

const operatorsFor = (fieldType: TExportHeader['fieldType']) =>
  OPERATOR_BY_TYPE[fieldType || 'text'] ?? OPERATOR_BY_TYPE.text;

const ConditionValueInput = ({
  fieldType,
  value,
  onChange,
}: {
  fieldType: TExportHeader['fieldType'];
  value: unknown;
  onChange: (value: unknown) => void;
}) => {
  if (fieldType === 'number') {
    return (
      <InputNumber
        value={value as number}
        onChange={(v) => onChange(v === '' ? undefined : v)}
        placeholder="Value"
      />
    );
  }

  if (fieldType === 'date') {
    return (
      <DatePicker
        value={value ? new Date(value as string) : undefined}
        onChange={(date) =>
          onChange(date ? (date as Date).toISOString() : undefined)
        }
      />
    );
  }

  return (
    <Input
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value"
    />
  );
};

const PickerValueInput = ({
  header,
  condition,
  allConditions,
  onChange,
  renderRelationValueInput,
}: {
  header: TExportHeader;
  condition: TSystemFieldCondition;
  allConditions: TSystemFieldCondition[];
  onChange: (value: unknown) => void;
  renderRelationValueInput?: TRenderRelationValueInput;
}) => {
  if (header.fieldType === 'select') {
    return (
      <Select
        value={(condition.value as string) || ''}
        onValueChange={onChange}
      >
        <Select.Trigger className="w-full">
          <Select.Value placeholder="Select value" />
        </Select.Trigger>
        <Select.Content>
          {(header.options || []).map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  if (header.relationKind === 'core:teamMembers') {
    return (
      <div className="w-full [&_button]:w-full">
        <SelectMember
          value={(condition.value as string) || ''}
          onValueChange={onChange}
          mode="single"
          placeholder="Select member"
        />
      </div>
    );
  }

  if (renderRelationValueInput) {
    return (
      <div className="w-full [&_button]:w-full">
        {renderRelationValueInput({
          header,
          condition,
          allConditions,
          onChange,
        })}
      </div>
    );
  }

  return (
    <Input
      value={(condition.value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value (id)"
    />
  );
};

const ConditionRow = ({
  headers,
  condition,
  allConditions,
  onChange,
  onRemove,
  renderRelationValueInput,
}: {
  headers: TExportHeader[];
  condition: TSystemFieldCondition;
  allConditions: TSystemFieldCondition[];
  onChange: (patch: Partial<TSystemFieldCondition>) => void;
  onRemove: () => void;
  renderRelationValueInput?: TRenderRelationValueInput;
}) => {
  const header = headers.find((h) => h.key === condition.key);
  const isPicker =
    header?.fieldType === 'relation' || header?.fieldType === 'select';
  const operators = operatorsFor(header?.fieldType);
  const activeOperator = operators.find(
    (op) => op.value === condition.operator,
  );
  const noValue = !!activeOperator?.noValue;

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <div className="flex items-center gap-2">
        <Select
          value={condition.key}
          onValueChange={(key) => {
            const nextHeader = headers.find((h) => h.key === key);
            if (
              nextHeader?.fieldType === 'relation' ||
              nextHeader?.fieldType === 'select'
            ) {
              onChange({ key, operator: 'eq', value: undefined });
              return;
            }
            const nextOperators = operatorsFor(nextHeader?.fieldType);
            onChange({
              key,
              operator: nextOperators[0].value,
              value: undefined,
            });
          }}
        >
          <Select.Trigger className="flex-1">
            <Select.Value placeholder="Select field" />
          </Select.Trigger>
          <Select.Content>
            {headers.map((h) => (
              <Select.Item key={h.key} value={h.key}>
                {h.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-none hover:text-destructive"
          onClick={onRemove}
        >
          <IconX />
        </Button>
      </div>

      {condition.key && header && isPicker && (
        <PickerValueInput
          header={header}
          condition={condition}
          allConditions={allConditions}
          onChange={(value) => onChange({ value })}
          renderRelationValueInput={renderRelationValueInput}
        />
      )}

      {condition.key && !isPicker && (
        <div
          className={cn('grid gap-2', noValue ? 'grid-cols-1' : 'grid-cols-2')}
        >
          <Select
            value={condition.operator}
            onValueChange={(operator) =>
              onChange({
                operator: operator as PropertyFilterOperator,
                value: undefined,
              })
            }
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {operators.map((op) => (
                <Select.Item key={op.value} value={op.value}>
                  {op.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          {!noValue && (
            <ConditionValueInput
              fieldType={header?.fieldType}
              value={condition.value}
              onChange={(value) => onChange({ value })}
            />
          )}
        </div>
      )}
    </div>
  );
};

export const ExportRecordFilters = ({
  headers,
  conditions,
  enabled,
  onEnableToggle,
  onAdd,
  onChange,
  onRemove,
  renderRelationValueInput,
}: {
  headers: TExportHeader[];
  conditions: TSystemFieldCondition[];
  enabled: boolean;
  onEnableToggle: (checked: boolean) => void;
  onAdd: () => void;
  onChange: (index: number, patch: Partial<TSystemFieldCondition>) => void;
  onRemove: (index: number) => void;
  renderRelationValueInput?: TRenderRelationValueInput;
}) => {
  const filterableHeaders = headers.filter((h) => h.fieldType);

  if (!filterableHeaders.length) {
    return null;
  }

  return (
    <InfoCard title="Filter records" className="mt-4 mb-2">
      <InfoCard.Content>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Filter records</span>
            <span className="text-xs text-muted-foreground">
              Only export records that match these conditions.
            </span>
          </div>
          <Switch checked={enabled} onCheckedChange={onEnableToggle} />
        </div>

        {enabled && (
          <div className="flex flex-col gap-2">
            {conditions.map((condition, index) => (
              <ConditionRow
                key={index}
                headers={filterableHeaders}
                condition={condition}
                allConditions={conditions}
                onChange={(patch) => onChange(index, patch)}
                onRemove={() => onRemove(index)}
                renderRelationValueInput={renderRelationValueInput}
              />
            ))}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={onAdd}
            >
              <IconPlus className="w-4 h-4 mr-1.5" />
              Add filter
            </Button>
          </div>
        )}
      </InfoCard.Content>
    </InfoCard>
  );
};
