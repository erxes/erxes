import { useCreateCustomerRecord } from '@/contacts/customers/hooks/useCreateCustomerRecord';
import { useTranslation } from 'react-i18next';
import { PanelDraftFields, useSidePanel, useSidePanelDraft } from 'ui-modules';

// A customer (or lead, `defaults.state`) not created yet: created on its
// first value, First name ready to type.
export const CustomerPanelNew = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { state } = useSidePanelDraft<{ state: 'customer' | 'lead' }>(
    'core:customer',
  );
  const { openRecord } = useSidePanel();
  const { createCustomerRecord, loading } = useCreateCustomerRecord();

  const create = async (values: Record<string, string>) => {
    const { data } = await createCustomerRecord(state || 'customer', values);
    const createdId = data?.customersAdd._id;

    if (createdId) {
      openRecord(
        { contentType: 'core:customer', contentId: createdId },
        { replace: true },
      );
    }
  };

  return (
    <PanelDraftFields
      scope="side-panel-customer-new"
      creating={loading}
      onCreate={create}
      fields={[
        { name: 'firstName', label: t('first-name', 'First name') },
        { name: 'lastName', label: t('last-name', 'Last name') },
        { name: 'primaryEmail', label: t('email', 'Email') },
        { name: 'primaryPhone', label: t('phone', 'Phone') },
      ]}
    />
  );
};
