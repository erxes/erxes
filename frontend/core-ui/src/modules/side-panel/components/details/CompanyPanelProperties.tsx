import { useCompanyCustomFieldEdit } from '@/contacts/companies/hooks/useCompanyCustomFieldEdit';
import { useCompanyDetailWithQuery } from '@/contacts/companies/hooks/useCompanyDetailWithQuery';
import { ContactDetailIdProvider } from '@/contacts/contexts/ContactDetailIdContext';
import { ScrollArea } from 'erxes-ui';
import { FieldsInDetail } from 'ui-modules';

const CompanyProperties = () => {
  const { companyDetail } = useCompanyDetailWithQuery();

  if (!companyDetail) {
    return null;
  }

  return (
    <div className="p-3">
      <FieldsInDetail
        bare
        fieldContentType="core:company"
        propertiesData={companyDetail.propertiesData || {}}
        mutateHook={useCompanyCustomFieldEdit}
        id={companyDetail._id}
      />
    </div>
  );
};

// The company's custom properties, as their own panel tab.
export const CompanyPanelProperties = ({
  companyId,
}: {
  companyId: string;
}) => (
  <ContactDetailIdProvider value={companyId}>
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <CompanyProperties />
    </ScrollArea>
  </ContactDetailIdProvider>
);
