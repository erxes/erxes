import { IconVariable } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataExtensionFields } from '../hooks/useDataExtensionFields';
import { useDataExtensionRecordTypes } from '../hooks/useDataExtensionRecordTypes';
import { DataExtensionValue } from '../types';
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
}: {
  /** Registry name, e.g. `core:company`. */
  recordType: string;
  className?: string;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { fields } = useDataExtensionFields({ recordType });
  const { recordTypes } = useDataExtensionRecordTypes();
  const [values, setValues] = useState<Record<string, DataExtensionValue>>({});
  const descriptor = recordTypes.find(
    (candidate) => candidate.recordType === recordType,
  );
  const creatable = Boolean(descriptor?.createMutations.length);

  const onSaved = useCallback(() => setValues({}), []);

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

  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <IconVariable className="size-4 text-muted-foreground" />
        {t('section.title')}
      </h3>
      <DataExtensionFieldsEditor
        fields={fields}
        values={values}
        idPrefix={`data-extensions-new-${recordType.replace(':', '-')}`}
        onChange={(key, value) =>
          setValues((current) => ({ ...current, [key]: value }))
        }
      />
    </section>
  );
};
