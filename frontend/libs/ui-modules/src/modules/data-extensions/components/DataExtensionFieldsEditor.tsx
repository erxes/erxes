import { Label } from 'erxes-ui';
import {
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionLinkedRecord,
} from '../types';
import { DataExtensionRelationValue } from './DataExtensionRelationValue';
import { DataExtensionValueInput } from './DataExtensionValueInput';

const WIDE_TYPES: IDataExtensionField['type'][] = [
  'longText',
  'multiSelect',
  'relation',
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
  /** `stack` puts every field on its own row, for narrow panels. */
  layout?: 'grid' | 'stack';
}) => (
  <div
    className={
      layout === 'stack' ? 'flex flex-col gap-4' : 'grid gap-5 sm:grid-cols-2'
    }
  >
    {fields.map((field) => {
      const inputId = `${idPrefix}-${field.key}`;

      return (
        <div
          key={field._id}
          className={
            layout === 'grid' && WIDE_TYPES.includes(field.type)
              ? 'flex flex-col gap-2 sm:col-span-2'
              : 'flex flex-col gap-2'
          }
        >
          <Label htmlFor={inputId}>{field.label}</Label>
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
              />
            )}
          </fieldset>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      );
    })}
  </div>
);
