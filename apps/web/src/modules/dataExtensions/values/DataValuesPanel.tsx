import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useFields } from '../dataQueries';
import { ValuesForm } from '../form/ValuesForm';
import { formFields } from '../values';

/**
 * A plugin record's Data Extensions values, read only, as their own panel tab: for a plugin
 * whose UI doesn't give core its values to edit (`dataFields`), core reads them from the
 * plugin's view. The plugin changes them where it edits the record.
 */
export const DataValuesPanel = ({
  recordType,
  recordId,
}: {
  recordType: string;
  recordId: string;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'values' });
  const fields = useFields(recordType);
  const values = useQuery(orpc.dataValues.get.queryOptions({ input: { recordType, recordId } }));

  return (
    <ScrollArea className="flex-1 min-h-0" fitWidth>
      <div className="flex flex-col gap-4 p-3">
        <p className="text-xs text-muted-foreground">
          {t(
            'keptByPlugin',
            'The plugin keeps these values. Change them where you edit the record.',
          )}
        </p>
        <QueryState query={fields}>
          {() => (
            <QueryState query={values}>
              {(saved) => (
                <ValuesForm
                  // The API leaves out the fields the member's role can't see.
                  fields={formFields(fields.fields, false).filter((field) =>
                    Object.hasOwn(saved.values, field.key),
                  )}
                  values={saved.values}
                />
              )}
            </QueryState>
          )}
        </QueryState>
      </div>
    </ScrollArea>
  );
};
