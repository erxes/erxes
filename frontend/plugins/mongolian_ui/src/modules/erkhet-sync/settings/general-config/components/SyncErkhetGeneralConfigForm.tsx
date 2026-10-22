import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSyncErkhetGeneralConfig } from '@/erkhet-sync/settings/general-config/hooks/useSyncErkhetGeneralConfig';
import { SyncErkhetGeneralConfigFormData } from '@/erkhet-sync/settings/general-config/types/SyncErkhetGeneralConfigTypes';

type TGeneralConfigField = {
  name: keyof SyncErkhetGeneralConfigFormData;
  label: string;
  placeholder: string;
};

const GENERAL_CONFIG_SECTIONS: {
  title: string;
  fields: TGeneralConfigField[];
}[] = [
  {
    title: 'general-settings',
    fields: [
      { name: 'apiKey', label: 'api-key', placeholder: 'enter-api-key' },
      {
        name: 'apiSecret',
        label: 'api-secret',
        placeholder: 'enter-api-secret',
      },
      { name: 'apiToken', label: 'api-token', placeholder: 'enter-api-token' },
    ],
  },
  {
    title: 'product-to-erkhet',
    fields: [
      {
        name: 'costAccount',
        label: 'cost-account',
        placeholder: 'enter-cost-account',
      },
      {
        name: 'salesAccount',
        label: 'sales-account',
        placeholder: 'enter-sales-account',
      },
      {
        name: 'productCategoryCode',
        label: 'product-category-code',
        placeholder: 'enter-product-category-code',
      },
      {
        name: 'consumeDescription',
        label: 'consume-products-description',
        placeholder: 'enter-consume-products-description',
      },
    ],
  },
  {
    title: 'customer-to-erkhet',
    fields: [
      {
        name: 'checkCompanyUrl',
        label: 'check-company-url',
        placeholder: 'enter-check-company-url',
      },
      {
        name: 'customerDefaultName',
        label: 'customer-default-name',
        placeholder: 'enter-customer-default-name',
      },
      {
        name: 'customerCategoryCode',
        label: 'customer-category-code',
        placeholder: 'enter-customer-category-code',
      },
      {
        name: 'companyCategoryCode',
        label: 'company-category-code',
        placeholder: 'enter-company-category-code',
      },
      {
        name: 'debtAccounts',
        label: 'debt-accounts',
        placeholder: 'enter-debt-accounts',
      },
    ],
  },
  {
    title: 'loan-transaction-to-erkhet',
    fields: [
      {
        name: 'userEmail',
        label: 'user-email',
        placeholder: 'enter-user-email',
      },
      {
        name: 'defaultCustomer',
        label: 'default-customer',
        placeholder: 'enter-default-customer',
      },
    ],
  },
];

export const SyncErkhetGeneralConfigForm = () => {
  const { form, handleUpdate, isUpdating, loading } =
    useSyncErkhetGeneralConfig();
  const { t } = useTranslation('mongolian');

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="flex h-full w-full flex-col overflow-hidden"
        onSubmit={form.handleSubmit(handleUpdate)}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
            {GENERAL_CONFIG_SECTIONS.map((section) => (
              <section
                key={section.title}
                className="rounded-lg border bg-background"
              >
                <h2 className="border-b px-4 py-3 text-sm font-semibold">
                  {t(section.title)}
                </h2>
                <div className="grid gap-4 p-4 md:grid-cols-2">
                  {section.fields.map((item) => (
                    <Form.Field
                      key={item.name}
                      name={item.name}
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t(item.label)}</Form.Label>
                          <Form.Control>
                            <Input
                              placeholder={t(item.placeholder)}
                              className="h-8"
                              {...field}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="flex justify-end border-t bg-background px-6 py-3">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
