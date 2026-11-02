import { useTranslation } from 'react-i18next';
import { ChoiceboxGroup } from 'erxes-ui';
import { MergingFieldContainer } from '@/contacts/customers/components/customers-command-bar/merge/MergingFieldContainer';
import { useCompaniesMergeContext } from '@/contacts/companies/hooks/useCompaniesMergeContext';

/** Right column: read-only preview of the company the merge will create. */
export const CompaniesMergeResult = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { results } = useCompaniesMergeContext();

  return (
    <div className="flex-[1.2] ml-5 flex flex-col gap-2">
      <span className="text-sm font-semibold text-primary mb-1">
        {t('merge-result')}
      </span>
      {results.map(({ key, label, type, value }) => (
        <ChoiceboxGroup key={key} className="flex flex-col gap-2">
          <MergingFieldContainer
            fieldName={label}
            fieldValue={value}
            type={type}
            value={key}
            disabled
          />
        </ChoiceboxGroup>
      ))}
    </div>
  );
};
