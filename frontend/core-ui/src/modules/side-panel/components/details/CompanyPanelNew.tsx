import { useCreateCompanyRecord } from '@/contacts/companies/hooks/useCreateCompanyRecord';
import { useTranslation } from 'react-i18next';
import { PanelDraftFields, useSidePanel } from 'ui-modules';

// A company not created yet: created on its first value, Name ready to type.
export const CompanyPanelNew = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { openRecord } = useSidePanel();
  const { createCompanyRecord, loading } = useCreateCompanyRecord();

  const create = async (values: Record<string, string>) => {
    const { data } = await createCompanyRecord(values);
    const createdId = data?.companiesAdd._id;

    if (createdId) {
      openRecord(
        { contentType: 'core:company', contentId: createdId },
        { replace: true },
      );
    }
  };

  return (
    <PanelDraftFields
      scope="side-panel-company-new"
      creating={loading}
      onCreate={create}
      fields={[
        { name: 'primaryName', label: t('field.primaryName', 'Name') },
        { name: 'primaryEmail', label: t('email', 'Email') },
        { name: 'primaryPhone', label: t('phone', 'Phone') },
      ]}
    />
  );
};
