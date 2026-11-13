import { ContactDetailIdProvider } from '@/contacts/contexts/ContactDetailIdContext';
import { useCustomerDetailWithQuery } from '@/contacts/customers/hooks/useCustomerDetailWithQuery';
import { useCustomerCustomFieldEdit } from '@/contacts/customers/hooks/useEditCustomerCustomFields';
import { ScrollArea } from 'erxes-ui';
import { FieldsInDetail } from 'ui-modules';

const CustomerProperties = () => {
  const { customerDetail } = useCustomerDetailWithQuery();

  if (!customerDetail) {
    return null;
  }

  return (
    <div className="p-3">
      <FieldsInDetail
        bare
        fieldContentType="core:customer"
        propertiesData={customerDetail.propertiesData || {}}
        mutateHook={useCustomerCustomFieldEdit}
        id={customerDetail._id}
      />
    </div>
  );
};

// The customer's custom properties, as their own panel tab.
export const CustomerPanelProperties = ({
  customerId,
}: {
  customerId: string;
}) => (
  <ContactDetailIdProvider value={customerId}>
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <CustomerProperties />
    </ScrollArea>
  </ContactDetailIdProvider>
);
