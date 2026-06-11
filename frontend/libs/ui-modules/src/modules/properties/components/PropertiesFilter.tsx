import { IconListDetails, IconTextSize, IconX } from '@tabler/icons-react';
import {
  Button,
  cn,
  Combobox,
  Command,
  DatePicker,
  Filter,
  Input,
  Popover,
  Spinner,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useFields } from '../hooks/useFields';
import { useFieldGroups } from '../hooks/useFieldGroups';
import { useFieldDetail } from '../hooks/useFieldDetail';
import {
  IField,
  IFieldGroup,
  IPropertyFilterCondition,
  PropertyFilterOperator,
} from '../types/fieldsTypes';
import { OPERATOR_BY_TYPE } from '../constants/field_operators';
import { FIELD_ICON_BY_TYPE } from '../constants/field_icons';
import {
  CompaniesInline,
  CustomersInline,
  SelectCompany,
  SelectCustomer,
} from 'ui-modules/modules/contacts';
import { ProductsInline, SelectProduct } from 'ui-modules/modules/products';
import { MembersInline, SelectMember } from 'ui-modules/modules/team-members';

const QUERY_KEY = 'propertiesData';

// Conditions are encoded in the URL as `fieldId:operator:value`, joined with
// `;`. Multiple values (in / notIn / fileType) are comma-separated. Each
// segment is URL-encoded so values containing the separators survive a
// round-trip. No-value operators (isSet, isFalse, …) omit the value segment.
const CONDITION_SEP = ';';
const PART_SEP = ':';
const VALUE_SEP = ',';

const MULTI_OPERATORS: PropertyFilterOperator[] = ['in', 'notIn', 'fileType'];

const encodeValue = (
  operator: PropertyFilterOperator,
  value: unknown,
): string => {
  if (MULTI_OPERATORS.includes(operator) || Array.isArray(value)) {
    const arr = Array.isArray(value) ? value : value == null ? [] : [value];
    return arr.map((v) => encodeURIComponent(String(v))).join(VALUE_SEP);
  }
  return encodeURIComponent(String(value ?? ''));
};

const decodeValue = (
  operator: PropertyFilterOperator,
  raw: string,
): unknown => {
  if (MULTI_OPERATORS.includes(operator)) {
    return raw
      .split(VALUE_SEP)
      .filter(Boolean)
      .map((v) => decodeURIComponent(v));
  }
  return decodeURIComponent(raw);
};

export const encodePropertiesData = (
  conditions: IPropertyFilterCondition[],
): string =>
  conditions
    .map((c) => {
      const head = `${encodeURIComponent(c.fieldId)}${PART_SEP}${c.operator}`;
      return c.value === undefined
        ? head
        : `${head}${PART_SEP}${encodeValue(c.operator, c.value)}`;
    })
    .join(CONDITION_SEP);

export const decodePropertiesData = (
  param?: string | null,
): IPropertyFilterCondition[] => {
  if (!param) {
    return [];
  }

  return param
    .split(CONDITION_SEP)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<IPropertyFilterCondition[]>((conditions, entry) => {
      // Split on the first two separators only; the value may itself contain
      // a `:` once decoded, but the raw segment was percent-encoded.
      const firstSep = entry.indexOf(PART_SEP);
      if (firstSep === -1) {
        return conditions;
      }
      const fieldId = decodeURIComponent(entry.slice(0, firstSep));

      const rest = entry.slice(firstSep + 1);
      const secondSep = rest.indexOf(PART_SEP);

      const operator = (
        secondSep === -1 ? rest : rest.slice(0, secondSep)
      ) as PropertyFilterOperator;

      if (!fieldId || !operator) {
        return conditions;
      }

      const condition: IPropertyFilterCondition = { fieldId, operator };

      if (secondSep !== -1) {
        condition.value = decodeValue(operator, rest.slice(secondSep + 1));
      }

      conditions.push(condition);
      return conditions;
    }, []);
};

const usePropertiesFilterState = () => {
  const [param, setParam] = useQueryState<string>(QUERY_KEY);

  const conditions = decodePropertiesData(param);

  const write = (next: IPropertyFilterCondition[]) =>
    setParam(next.length ? encodePropertiesData(next) : null);

  const upsert = (next: IPropertyFilterCondition) => {
    const idx = conditions.findIndex((c) => c.fieldId === next.fieldId);
    write(
      idx === -1
        ? [...conditions, next]
        : conditions.map((c, i) => (i === idx ? next : c)),
    );
  };

  const removeByFieldId = (fieldId: string) => {
    write(conditions.filter((c) => c.fieldId !== fieldId));
  };

  return {
    conditions,
    upsert,
    removeByFieldId,
  };
};

const PropertiesFilterCommandItem = () => {
  return (
    <Filter.Item value={QUERY_KEY}>
      <IconListDetails />
      Properties
    </Filter.Item>
  );
};

const PropertyValueInput = ({
  field,
  operator,
  value,
  onChange,
}: {
  field: IField;
  operator: PropertyFilterOperator;
  value: unknown;
  onChange: (value: unknown) => void;
}) => {
  const isRelation = field.type.startsWith('relation');
  const operators =
    OPERATOR_BY_TYPE[isRelation ? 'relation' : field.type] ??
    OPERATOR_BY_TYPE.text;

  if (operators.find((op) => op.value === operator)?.noValue) {
    return null;
  }

  const multiple = operator === 'in' || operator === 'notIn';

  if (isRelation) {
    // Picker fields come normalized (type 'relation' + relationType), bar
    // fields come raw (type 'relation:core:customer'); both resolve here.
    const relationType =
      field.type === 'relation' ? `relation:${field.relationType}` : field.type;
    return (
      <RelationValueInput
        relationType={relationType}
        fieldId={field._id}
        multiple={multiple}
        value={value}
        onChange={onChange}
      />
    );
  }

  switch (field.type) {
    case 'number':
      return (
        <Input
          type="number"
          value={(value as string) ?? ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? '' : Number(e.target.value))
          }
          placeholder="Value"
        />
      );

    case 'date':
      return (
        <DatePicker
          value={value ? new Date(value as string) : undefined}
          onChange={(date) =>
            onChange(date ? (date as Date).toISOString() : null)
          }
        />
      );

    case 'select':
    case 'radio':
    case 'check':
    case 'multiSelect': {
      const options = field.options || [];

      const selected = Array.isArray(value)
        ? (value as string[])
        : value
          ? [value as string]
          : [];

      const toggle = (optionValue: string) => {
        if (multiple) {
          const next = selected.includes(optionValue)
            ? selected.filter((v) => v !== optionValue)
            : [...selected, optionValue];
          onChange(next);
        } else {
          onChange(optionValue);
        }
      };

      if (!options.length) {
        return (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            No options.
          </p>
        );
      }

      return (
        <div className="flex max-h-48 flex-col gap-px overflow-y-auto">
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className={cn(
                  'flex h-8 items-center gap-2 rounded px-2 text-sm text-left transition-colors hover:bg-accent',
                  isSelected && 'text-primary',
                )}
              >
                <span className="truncate">{option.label}</span>
                <Combobox.Check checked={isSelected} className="text-primary" />
              </button>
            );
          })}
        </div>
      );
    }

    case 'file': {
      const text = Array.isArray(value)
        ? (value as string[]).join(', ')
        : ((value as string) ?? '');
      return (
        <Input
          value={text}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean),
            )
          }
          placeholder="e.g. pdf, image, application/pdf"
        />
      );
    }

    case 'text':
    case 'textarea':
    case 'phone':
    default:
      return (
        <Input
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Value"
        />
      );
  }
};

const RelationValueInput = ({
  relationType,
  fieldId,
  multiple,
  value,
  onChange,
}: {
  relationType?: string;
  fieldId: string;
  multiple: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
}) => {
  const mode = multiple ? 'multiple' : 'single';

  const commonProps = {
    scope: `properties-filter-${fieldId}`,
    value: (value as string | string[]) ?? undefined,
    mode: mode as 'single' | 'multiple',
    onValueChange: (val: string | string[] | null) => onChange(val),
    placeholder: '',
  };

  switch (relationType) {
    case 'relation:core:customer':
      return <SelectCustomer {...commonProps} />;
    case 'relation:core:company':
      return <SelectCompany {...commonProps} />;
    case 'relation:core:product':
      return <SelectProduct {...commonProps} />;
    case 'relation:core:teamMembers':
      return <SelectMember {...commonProps} />;
    default:
      return null;
  }
};

const RelationValueDisplay = ({
  relationType,
  value,
}: {
  relationType?: string;
  value: unknown;
}) => {
  const ids = (Array.isArray(value) ? value : value ? [value] : []) as string[];

  switch (relationType) {
    case 'relation:core:customer':
      return <CustomersInline customerIds={ids} hideAvatar />;
    case 'relation:core:company':
      return <CompaniesInline companyIds={ids} />;
    case 'relation:core:product':
      return <ProductsInline productIds={ids} />;
    case 'relation:core:teamMembers':
      return <MembersInline memberIds={ids} />;
    default:
      return <>{ids.join(', ')}</>;
  }
};

const PropertyConditionEditor = ({
  field,
  condition,
  onApply,
}: {
  field: IField;
  condition?: IPropertyFilterCondition;
  onApply: (condition: IPropertyFilterCondition) => void;
}) => {
  const operators =
    OPERATOR_BY_TYPE[
      field.type.startsWith('relation') ? 'relation' : field.type
    ] ?? OPERATOR_BY_TYPE.text;
  const [operator, setOperator] = useState<PropertyFilterOperator>(
    condition?.operator ?? operators[0].value,
  );
  const [value, setValue] = useState<unknown>(condition?.value);

  const isNoValue = (op: PropertyFilterOperator) =>
    !!operators.find((o) => o.value === op)?.noValue;

  const apply = (op: PropertyFilterOperator, val: unknown) =>
    onApply({
      fieldId: field._id,
      type: field.type,
      operator: op,
      value: isNoValue(op) ? undefined : val,
    });

  return (
    <div className="w-72">
      <Command>
        <Command.List className="max-h-none p-1">
          {operators.map((op) => (
            <Command.Item
              key={op.value}
              value={op.value}
              onSelect={() => {
                setOperator(op.value);
                if (op.noValue) {
                  apply(op.value, undefined);
                }
              }}
              className={cn('h-8', operator === op.value && 'text-primary')}
            >
              {op.label}
              <Combobox.Check
                checked={operator === op.value}
                className="text-primary"
              />
            </Command.Item>
          ))}
        </Command.List>
      </Command>

      {!isNoValue(operator) && (
        <div className="flex flex-col gap-2 border-t p-2">
          <PropertyValueInput
            field={field}
            operator={operator}
            value={value}
            onChange={setValue}
          />
          <Button
            size="sm"
            onClick={() => apply(operator, value)}
            disabled={
              value == null ||
              value === '' ||
              (Array.isArray(value) && !value.length)
            }
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
};

const PropertyOperatorPicker = ({
  field,
  condition,
  onApply,
}: {
  field: IField;
  condition: IPropertyFilterCondition;
  onApply: (condition: IPropertyFilterCondition) => void;
}) => {
  const operators =
    OPERATOR_BY_TYPE[
      field.type.startsWith('relation') ? 'relation' : field.type
    ] ?? OPERATOR_BY_TYPE.text;

  return (
    <Command>
      <Command.List className="max-h-none p-1">
        {operators.map((op) => (
          <Command.Item
            key={op.value}
            value={op.value}
            onSelect={() =>
              onApply({
                fieldId: field._id,
                type: field.type,
                operator: op.value,
                value: op.noValue ? undefined : condition.value,
              })
            }
            className={cn(
              'h-8',
              condition.operator === op.value && 'text-primary',
            )}
          >
            {op.label}
            <Combobox.Check
              checked={condition.operator === op.value}
              className="text-primary"
            />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const PropertyValueEditor = ({
  field,
  condition,
  onApply,
}: {
  field: IField;
  condition: IPropertyFilterCondition;
  onApply: (condition: IPropertyFilterCondition) => void;
}) => {
  const [value, setValue] = useState<unknown>(condition.value);

  return (
    <div className="flex flex-col gap-2 p-2 w-72">
      <PropertyValueInput
        field={field}
        operator={condition.operator}
        value={value}
        onChange={setValue}
      />
      <Button
        size="sm"
        disabled={
          value == null ||
          value === '' ||
          (Array.isArray(value) && !value.length)
        }
        onClick={() =>
          onApply({
            fieldId: field._id,
            type: field.type,
            operator: condition.operator,
            value,
          })
        }
      >
        Apply
      </Button>
    </div>
  );
};

const PropertyGroupItems = ({
  group,
  contentType,
  onSelect,
}: {
  group: IFieldGroup;
  contentType: string;
  onSelect: (field: IField) => void;
}) => {
  const { fields } = useFields({ groupId: group._id, contentType });

  if (!fields.length) {
    return null;
  }

  return (
    <Command.Group heading={group.name}>
      {fields.map((field) => {
        const TypeIcon = FIELD_ICON_BY_TYPE[field.type] ?? IconTextSize;
        return (
          <Command.Item
            key={field._id}
            value={`${group.name} ${field.name} ${field.code}`}
            onSelect={() => onSelect(field)}
            className="h-8"
          >
            <TypeIcon className="mr-1 size-4 text-muted-foreground" />
            {field.name}
          </Command.Item>
        );
      })}
    </Command.Group>
  );
};

const PropertiesFilterView = ({ contentType }: { contentType: string }) => {
  const { resetFilterState } = useFilterContext();
  const { upsert, conditions } = usePropertiesFilterState();
  const { fieldGroups, loading: groupsLoading } = useFieldGroups({
    contentType,
  });
  const [selectedField, setSelectedField] = useState<IField | null>(null);

  if (groupsLoading) {
    return (
      <Filter.View filterKey={QUERY_KEY}>
        <Spinner containerClassName="py-6" />
      </Filter.View>
    );
  }

  return (
    <Filter.View filterKey={QUERY_KEY}>
      {selectedField ? (
        <PropertyConditionEditor
          field={selectedField}
          condition={conditions.find((c) => c.fieldId === selectedField._id)}
          onApply={(condition) => {
            upsert(condition);
            setSelectedField(null);
            resetFilterState();
          }}
        />
      ) : (
        <Command>
          <Command.Input placeholder="Search properties..." />
          <Command.List>
            <Command.Empty>No properties found.</Command.Empty>
            {fieldGroups.map((group) => (
              <PropertyGroupItems
                key={group._id}
                group={group}
                contentType={contentType}
                onSelect={setSelectedField}
              />
            ))}
          </Command.List>
        </Command>
      )}
    </Filter.View>
  );
};

const PropertiesFilterBar = (_: { contentType: string }) => {
  const { conditions, upsert, removeByFieldId } = usePropertiesFilterState();

  if (!conditions.length) {
    return null;
  }

  return (
    <>
      {conditions.map((condition) => (
        <PropertyBarItem
          key={condition.fieldId}
          condition={condition}
          onApply={upsert}
          onRemove={() => removeByFieldId(condition.fieldId)}
        />
      ))}
    </>
  );
};

const PropertyBarItem = ({
  condition,
  onApply,
  onRemove,
}: {
  condition: IPropertyFilterCondition;
  onApply: (condition: IPropertyFilterCondition) => void;
  onRemove: () => void;
}) => {
  const [operatorOpen, setOperatorOpen] = useState(false);
  const [valueOpen, setValueOpen] = useState(false);

  const { field: fetched } = useFieldDetail(condition.fieldId);

  const field: IField =
    fetched ?? ({ _id: condition.fieldId, name: '', type: 'text' } as IField);

  const isRelation = field.type.startsWith('relation');
  const operators =
    OPERATOR_BY_TYPE[isRelation ? 'relation' : field.type] ??
    OPERATOR_BY_TYPE.text;
  const activeOperator = operators.find(
    (op) => op.value === condition.operator,
  );
  const operatorLabel = activeOperator?.label;
  const noValue = !!activeOperator?.noValue;

  const valueDisplay = () => {
    const v = condition.value;
    if (isRelation) {
      return <RelationValueDisplay relationType={field.type} value={v} />;
    }
    if (Array.isArray(v)) {
      return condition.operator === 'fileType'
        ? v.join(', ')
        : `${v.length} selected`;
    }
    if (field.type === 'date' && typeof v === 'string') {
      return v.slice(0, 10);
    }
    return String(v ?? '');
  };

  return (
    <div className="flex items-stretch gap-px bg-muted shadow-xs rounded h-7 font-medium text-sm">
      <Filter.BarName>
        <IconListDetails />
        {field.name || 'Property'}
      </Filter.BarName>

      <Popover open={operatorOpen} onOpenChange={setOperatorOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton className="justify-start overflow-hidden text-muted-foreground">
            {operatorLabel}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content className="w-56">
          <PropertyOperatorPicker
            field={field}
            condition={condition}
            onApply={(next) => {
              onApply(next);
              setOperatorOpen(false);
              // Jump straight to the value editor unless the new operator
              // takes no value (isSet / isFalse / …).
              const nextNoValue = !!operators.find(
                (op) => op.value === next.operator,
              )?.noValue;
              if (!nextNoValue) {
                setValueOpen(true);
              }
            }}
          />
        </Combobox.Content>
      </Popover>

      {!noValue && (
        <Popover open={valueOpen} onOpenChange={setValueOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton className="justify-start max-w-72 overflow-hidden">
              {valueDisplay()}
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content className="w-72">
            <PropertyValueEditor
              field={field}
              condition={condition}
              onApply={(next) => {
                onApply(next);
                setValueOpen(false);
              }}
            />
          </Combobox.Content>
        </Popover>
      )}

      <Button
        variant="ghost"
        size="icon"
        className={cn('bg-background rounded-l-none')}
        onClick={onRemove}
      >
        <IconX />
      </Button>
    </div>
  );
};

export const PropertiesFilter = Object.assign(PropertiesFilterCommandItem, {
  View: PropertiesFilterView,
  Bar: PropertiesFilterBar,
});
