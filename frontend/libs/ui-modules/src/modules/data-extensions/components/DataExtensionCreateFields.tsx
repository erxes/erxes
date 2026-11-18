import { IconVariable } from '@tabler/icons-react';
import { cn, Separator } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataExtensionFields } from '../hooks/useDataExtensionFields';
import { useDataExtensionRecordTypes } from '../hooks/useDataExtensionRecordTypes';
import { DataExtensionValue, showsInCreate } from '../types';
import {
  clearDataExtensionCreateValues,
  setDataExtensionCreateValues,
} from '../utils/createValues';
import { DataExtensionFieldsEditor } from './DataExtensionFieldsEditor';

/**
 * The Data Extension fields of a record type on its module's create form,
 * built from the current definitions. The form needs no saving code: the
 * values are written when the record type's create mutation returns (see
 * `createDataExtensionsCreateLink`). Renders nothing when the record type
 * has no fields or is not created from a form.
 */
export const DataExtensionCreateFields = ({
  recordType,
  className,
  layout,
}: {
  /** Registry name, e.g. `core:company`. */
  recordType: string;
  className?: string;
  /** `stack` for narrow forms such as the side panel. */
  layout?: 'grid' | 'stack';
}) => {
  const { t } = useTranslation('dataExtensions');
  const { fields: allFields } = useDataExtensionFields({ recordType });
  const fields = useMemo(() => allFields.filter(showsInCreate), [allFields]);
  const { recordTypes } = useDataExtensionRecordTypes();
  const [values, setValues] = useState<Record<string, DataExtensionValue>>({});
  const descriptor = recordTypes.find(
    (candidate) => candidate.recordType === recordType,
  );
  const creatable = Boolean(descriptor?.createMutations.length);

  const onSaved = useCallback(() => setValues({}), []);

  // Defaults fill fields the user has not touched yet.
  useEffect(() => {
    setValues((current) => {
      const next = { ...current };
      let changed = false;

      for (const field of fields) {
        const fallback = field.settings?.defaultValue;

        if (!(field.key in next) && fallback !== undefined && fallback !== null) {
          next[field.key] = fallback;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [fields]);

  useEffect(() => {
    if (descriptor && creatable) {
      setDataExtensionCreateValues({
        recordType: descriptor,
        fields,
        recordTypes,
        values,
        onSaved,
      });
    }
  }, [descriptor, creatable, fields, recordTypes, values, onSaved]);

  useEffect(
    () => () => clearDataExtensionCreateValues(recordType),
    [recordType],
  );

  if (!creatable || !fields.length) {
    return null;
  }

  const stack = layout === 'stack';

  return (
    <section
      className={cn(
        'flex flex-col motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200',
        stack ? 'gap-2' : 'gap-4',
        className,
      )}
    >
      {stack ? (
        <h3 className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {t('section.title')}
          <Separator className="flex-1" />
        </h3>
      ) : (
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <IconVariable className="size-4 text-muted-foreground" />
          {t('section.title')}
        </h3>
      )}
      <DataExtensionFieldsEditor
        fields={fields}
        values={values}
        idPrefix={`data-extensions-new-${recordType.replace(':', '-')}`}
        layout={layout}
        onChange={(key, value) =>
          setValues((current) => ({ ...current, [key]: value }))
        }
      />
    </section>
  );
};
