import { ScrollArea } from 'erxes-ui';
import { useCompany, useCompanyEdit } from '~/modules/contacts/companies/useCompanies';
import { useCustomer, useCustomerEdit } from '~/modules/contacts/customers/useCustomers';
import { CustomFieldSections } from '~/modules/properties/CustomFieldSections';

/** A customer's custom fields, as their own panel tab. */
export const CustomerPanelProperties = ({ customerId }: { customerId: string }) => {
  const { data } = useCustomer(customerId);
  const edit = useCustomerEdit();

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="p-3">
        <CustomFieldSections
          contentType="customer"
          scope={`side-panel-customer.${customerId}`}
          values={data?.customFields}
          onSave={(customFields) => edit.mutate({ id: customerId, customFields })}
        />
      </div>
    </ScrollArea>
  );
};

/** A company's custom fields, as their own panel tab. */
export const CompanyPanelProperties = ({ companyId }: { companyId: string }) => {
  const { data } = useCompany(companyId);
  const edit = useCompanyEdit();

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="p-3">
        <CustomFieldSections
          contentType="company"
          scope={`side-panel-company.${companyId}`}
          values={data?.customFields}
          onSave={(customFields) => edit.mutate({ id: companyId, customFields })}
        />
      </div>
    </ScrollArea>
  );
};
