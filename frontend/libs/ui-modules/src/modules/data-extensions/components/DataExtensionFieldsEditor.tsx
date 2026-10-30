import { cn, Label } from 'erxes-ui';
import {
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionLinkedRecord,
  isComputedField,
  isFieldVisible,
} from '../types';
import { DataExtensionFieldLabel } from './DataExtensionFieldLabel';
import { DataExtensionRelationValue } from './DataExtensionRelationValue';
import { DataExtensionValueInput } from './DataExtensionValueInput';

const WIDE_TYPES: IDataExtensionField['type'][] = [
  'longText',
  'multiSelect',
  'relation',
  'address',
  'links',
  'files',
  'json',
];

/** Values taller than one row: their label sits at the top of the row. */
const TALL_TYPES: IDataExtensionField['type'][] = [
  'longText',
  'multiSelect',
  'address',
  'fullName',
  'links',
  'emails',
  'phones',
  'files',
  'json',
];

/**
 * The editors for a record type's extension fields, laid out as a form
 * grid. Used by the Data Extensions screen and by modules that show the
 * fields on their own create and detail screens.
 */
export const DataExtensionFieldsEditor = ({
  fields,
  values,
  onChange,
  links = {},
  editableLinks,
  disabled,
  idPrefix = 'data-extensions-value',
  layout = 'grid',
}: {
  fields: IDataExtensionField[];
  values: Record<string, DataExtensionValue>;
  onChange: (key: string, value: DataExtensionValue) => void;
  /** Resolved linked records per relation key, for names. */
  links?: Record<string, IDataExtensionLinkedRecord[]>;
  /** Relation keys that may be edited; every relation when omitted. */
  editableLinks?: string[];
  disabled?: boolean;
  idPrefix?: string;
  /** `stack` lays fields out as side panel rows: label, then value. */
  layout?: 'grid' | 'stack';
}) => {
  const stack = layout === 'stack';

  return (
    <div
      className={stack ? 'flex flex-col gap-1' : 'grid gap-5 sm:grid-cols-2'}
    >
      {fields
        .filter(
          (field) => !isComputedField(field) && isFieldVisible(field, values),
        )
        .map((field) => {
          const inputId = `${idPrefix}-${field.key}`;
          const tall =
            Boolean(field.relation) || TALL_TYPES.includes(field.type);
          const input = (
            <fieldset disabled={disabled} className="min-w-0">
              {field.relation ? (
                <DataExtensionRelationValue
                  id={inputId}
                  field={field}
                  value={values[field.key] ?? null}
                  links={links[field.key] || []}
                  editable={!editableLinks || editableLinks.includes(field.key)}
                  onChange={(value) => onChange(field.key, value)}
                />
              ) : (
                <DataExtensionValueInput
                  id={inputId}
                  field={field}
                  value={values[field.key] ?? null}
                  onChange={(value) => onChange(field.key, value)}
                  compact={stack}
                />
              )}
            </fieldset>
          );

          if (stack) {
            return (
              <div
                key={field._id}
                className={cn(
                  'grid min-h-7 grid-cols-[6.5rem_minmax(0,1fr)] gap-x-2',
                  tall ? 'items-start' : 'items-center',
                )}
              >
                <DataExtensionFieldLabel
                  field={field}
                  htmlFor={inputId}
                  className={tall ? 'pt-1.5' : undefined}
                />
                {input}
              </div>
            );
          }

          return (
            <div
              key={field._id}
              className={cn(
                'flex flex-col gap-2',
                WIDE_TYPES.includes(field.type) && 'sm:col-span-2',
              )}
            >
              <Label htmlFor={inputId}>{field.label}</Label>
              {input}
              {field.description && (
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
          );
        })}
    </div>
  );
};
