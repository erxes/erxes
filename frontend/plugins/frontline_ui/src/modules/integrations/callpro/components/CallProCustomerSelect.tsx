import { IconCheck } from '@tabler/icons-react';
import { Command, Spinner, formatPhoneNumber } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CustomersInline, ICustomer } from 'ui-modules';
import { useCallProCustomerSelect } from '@/integrations/callpro/hooks/useCallProCustomerSelect';

export const CallProCustomerSelect = ({
  conversationId,
  customers,
  selectedCustomerId,
}: {
  conversationId: string;
  customers: ICustomer[];
  selectedCustomerId?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { callProCustomerSelect, loading } = useCallProCustomerSelect();

  if (customers.length === 0) {
    return (
      <div className="text-sm text-accent-foreground">
        {t('callpro-no-customers-for-phone')}
      </div>
    );
  }

  return (
    <Command shouldFilter={false}>
      <Command.List className="max-h-64 overflow-auto p-1">
        {customers.map((customer) => (
          <Command.Item
            key={customer._id}
            value={customer._id}
            disabled={loading}
            onSelect={() =>
              callProCustomerSelect({
                variables: { conversationId, customerId: customer._id },
              })
            }
          >
            <CustomersInline
              customers={[customer]}
              placeholder={t('unnamed-customer')}
            />
            {customer.primaryPhone && (
              <span className="text-sm text-accent-foreground">
                {formatPhoneNumber({
                  value: customer.primaryPhone,
                  defaultCountry: 'MN',
                })}
              </span>
            )}
            {customer._id === selectedCustomerId && (
              <span className="ml-auto flex items-center gap-1 text-sm font-medium text-primary">
                <IconCheck className="size-4" />
                {t('callpro-current-customer')}
              </span>
            )}
            {loading && <Spinner size="sm" className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
