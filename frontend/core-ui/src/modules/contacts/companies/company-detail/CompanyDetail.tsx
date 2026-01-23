import { Separator } from 'erxes-ui';
import { CompanyDetailGeneral } from '@/contacts/companies/company-detail/CompanyDetailGeneral';
import { ContactsDetailLayout } from '@/contacts/components/ContactsDetail';
import { useCompanyDetailWithQuery } from '@/contacts/companies/hooks/useCompanyDetailWithQuery';
import { CompanyDetailFields } from '@/contacts/companies/company-detail/CompanyDetailFields';
import { FieldsInDetail } from 'ui-modules';
import { useCompanyCustomFieldEdit } from '../hooks/useCompanyCustomFieldEdit';

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
        <Separator />
        <div className="p-8">
          <FieldsInDetail
            fieldContentType="core:company"
            customFieldsData={companyDetail?.customFieldsData || {}}
            mutateHook={useCompanyCustomFieldEdit}
            id={companyDetail?._id || ''}
          />
        </div>
      </div>
    </ContactsDetailLayout>
  );
};

export const CompanyDetailActions = () => {
  return <div></div>;
};
