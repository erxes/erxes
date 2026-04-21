import { Accordion, Button, Form, Input } from 'erxes-ui';
import { useSyncErkhetGeneralConfig } from '@/erkhet-sync/settings/general-config/hooks/useSyncErkhetGeneralConfig';
import { SyncErkhetGeneralConfigFormData } from '@/erkhet-sync/settings/general-config/types/SyncErkhetGeneralConfigTypes';

const TRIGGER_CLASS = 'text-xl font-semibold no-underline hover:no-underline';

const fields: {
  section: string;
  value: string;
  items: { name: keyof SyncErkhetGeneralConfigFormData; label: string; placeholder: string }[];
}[] = [
  {
    section: 'General settings',
    value: 'general',
    items: [
      { name: 'apiKey', label: 'Api key', placeholder: 'Enter api key' },
      { name: 'apiSecret', label: 'Api secret', placeholder: 'Enter api secret' },
      { name: 'apiToken', label: 'Api token', placeholder: 'Enter api token' },
      { name: 'getRemainderUrl', label: 'Get remainder url', placeholder: 'Enter get remainder url' },
    ],
  },
  {
    section: 'Product to erkhet',
    value: 'product',
    items: [
      { name: 'costAccount', label: 'Cost account', placeholder: 'Enter cost account' },
      { name: 'salesAccount', label: 'Sales account', placeholder: 'Enter sales account' },
      { name: 'productCategoryCode', label: 'Product category code', placeholder: 'Enter product category code' },
      { name: 'consumeDescription', label: 'Consume products description', placeholder: 'Enter consume products description' },
    ],
  },
  {
    section: 'Customer to erkhet',
    value: 'customer',
    items: [
      { name: 'checkCompanyUrl', label: 'Check company url', placeholder: 'Enter check company url' },
      { name: 'customerDefaultName', label: 'Customer default name', placeholder: 'Enter customer default name' },
      { name: 'customerCategoryCode', label: 'Customer category code', placeholder: 'Enter customer category code' },
      { name: 'companyCategoryCode', label: 'Company category code', placeholder: 'Enter company category code' },
      { name: 'debtAccounts', label: 'Debt accounts', placeholder: 'Enter debt accounts' },
    ],
  },
  {
    section: 'Loan transaction to erkhet',
    value: 'loan',
    items: [
      { name: 'userEmail', label: 'User email', placeholder: 'Enter user email' },
      { name: 'defaultCustomer', label: 'Default customer', placeholder: 'Enter default customer' },
    ],
  },
];

export const SyncErkhetGeneralConfigForm = () => {
  const { form, handleUpdate, isUpdating } = useSyncErkhetGeneralConfig();

  return (
    <Form {...form}>
      <form
        className="h-full w-full mx-auto max-w-4xl px-9 py-5 flex flex-col gap-4 overflow-y-auto"
        onSubmit={form.handleSubmit(handleUpdate)}
      >
        <Accordion
          type="multiple"
          defaultValue={fields.map((f) => f.value)}
          className="w-full"
        >
          {fields.map(({ section, value, items }) => (
            <Accordion.Item key={value} value={value}>
              <Accordion.Trigger className={TRIGGER_CLASS}>
                {section}
              </Accordion.Trigger>
              <Accordion.Content>
                <div className="flex flex-col gap-4 pt-2">
                  {items.map(({ name, label, placeholder }) => (
                    <Form.Field
                      key={name}
                      name={name}
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{label}</Form.Label>
                          <Form.Message />
                          <Form.Control>
                            <Input
                              placeholder={placeholder}
                              className="h-8"
                              {...field}
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>

        <div className="text-right">
          <Button className="flex-none" type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
