import { Separator } from 'erxes-ui';
import { CompanyDetailGeneral } from '@/contacts/companies/company-detail/CompanyDetailGeneral';
import { ContactsDetailLayout } from '@/contacts/components/ContactsDetail';
import { useCompanyDetailWithQuery } from '@/contacts/companies/hooks/useCompanyDetailWithQuery';
import { CompanyDetailFields } from '@/contacts/companies/company-detail/CompanyDetailFields';

export const CompanyDetail = () => {
  const { companyDetail, loading } = useCompanyDetailWithQuery();
  return (
    <ContactsDetailLayout
      loading={loading}
      notFound={!companyDetail}
      title="Company Details"
      actions={<CompanyDetailActions />}
    >
      <div className="flex flex-col flex-auto">
        <CompanyDetailGeneral />
        <Separator />
        <CompanyDetailFields />
      </div>
    </ContactsDetailLayout>
  );
};

export const CompanyDetailActions = () => {
  return <div></div>;
};
