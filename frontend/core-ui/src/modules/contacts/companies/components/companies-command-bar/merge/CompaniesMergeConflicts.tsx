import { useTranslation } from 'react-i18next';
import { useCompaniesMergeContext } from '@/contacts/companies/hooks/useCompaniesMergeContext';
import { CompaniesMergeConflictRow } from './CompaniesMergeConflictRow';

/** Left column: one row per field the two companies disagree on. */
export const CompaniesMergeConflicts = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { companyNames, conflicts } = useCompaniesMergeContext();
  const hasConflicts = conflicts.length > 0;

  return (
    <div className="flex-2 flex flex-col gap-2">
      <div className="flex justify-between gap-2 mb-1">
        {companyNames.map(({ _id, name }) => (
          <span
            key={_id}
            className="text-sm font-semibold text-muted-foreground w-full"
          >
            {name}
          </span>
        ))}
      </div>
      {!hasConflicts && (
        <span className="text-sm text-muted-foreground">
          {t('merge-no-conflicts')}
        </span>
      )}
      {conflicts.map((conflict) => (
        <CompaniesMergeConflictRow key={conflict.key} conflict={conflict} />
      ))}
    </div>
  );
};
