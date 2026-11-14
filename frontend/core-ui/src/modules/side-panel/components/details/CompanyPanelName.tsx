import { TextField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ICompany, useCompaniesEdit } from 'ui-modules';

/** Edits the company's name in place, in the panel's top bar. */
export const CompanyPanelName = ({ company }: { company: ICompany }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { companiesEdit } = useCompaniesEdit();

  return (
    <TextField
      scope={`side-panel-company.${company._id}.name`}
      value={company.primaryName || ''}
      placeholder={t('field.primaryName', 'Name')}
      className="rounded-sm px-1 font-medium shadow-none"
      onSave={(primaryName) =>
        primaryName.trim() &&
        companiesEdit({ variables: { _id: company._id, primaryName } })
      }
    />
  );
};
