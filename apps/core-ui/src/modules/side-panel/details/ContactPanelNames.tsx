import type { Company, Customer } from '@erxes/core-contract';
import { FullNameValue, TextField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCompanyEdit } from '~/modules/contacts/companies/useCompanies';
import { ContactName } from '~/modules/contacts/components/ContactFields';
import { useCustomerEdit } from '~/modules/contacts/customers/useCustomers';
import { PanelFieldTrigger } from '../PanelField';

/** Edits the customer's name in place, the same way its table cell does. */
export const CustomerPanelName = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const { id, firstName, middleName, lastName } = customer;

  return (
    <ContactName
      firstName={firstName}
      lastName={`${middleName || ''}${middleName ? ' ' : ''}${lastName || ''}`}
      scope={`side-panel-customer.${id}.name`}
      onSave={(nextFirstName, nextLastName) =>
        edit.mutate({
          id,
          firstName: nextFirstName || null,
          middleName: null,
          lastName: nextLastName || null,
        })
      }
    >
      {/* Keeps the cell's 32px height, which its editor's position assumes. */}
      <PanelFieldTrigger variant="title">
        <FullNameValue />
      </PanelFieldTrigger>
    </ContactName>
  );
};

/** Edits the company's name in place, in the panel's top bar. */
export const CompanyPanelName = ({ company }: { company: Company }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const edit = useCompanyEdit();

  return (
    <TextField
      scope={`side-panel-company.${company.id}.name`}
      value={company.primaryName || ''}
      placeholder={t('field.primaryName', 'Name')}
      variant="title"
      onSave={(primaryName) => {
        if (primaryName.trim() && primaryName.trim() !== company.primaryName) {
          edit.mutate({ id: company.id, primaryName: primaryName.trim() });
        }
      }}
    />
  );
};
