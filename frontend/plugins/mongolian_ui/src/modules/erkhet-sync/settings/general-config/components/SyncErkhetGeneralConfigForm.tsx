import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSyncErkhetGeneralConfig } from '@/erkhet-sync/settings/general-config/hooks/useSyncErkhetGeneralConfig';
import { SyncErkhetGeneralConfigFormData } from '@/erkhet-sync/settings/general-config/types/SyncErkhetGeneralConfigTypes';

type TGeneralConfigFieldName = keyof SyncErkhetGeneralConfigFormData;

const GENERAL_CONFIG_LABELS: Record<TGeneralConfigFieldName, string> = {
  apiKey: 'api-key',
  apiSecret: 'api-secret',
  apiToken: 'api-token',
  costAccount: 'cost-account',
  salesAccount: 'sales-account',
  productCategoryCode: 'product-category-code',
  consumeDescription: 'consume-products-description',
  checkCompanyUrl: 'check-company-url',
  customerDefaultName: 'customer-default-name',
  customerCategoryCode: 'customer-category-code',
  companyCategoryCode: 'company-category-code',
  debtAccounts: 'debt-accounts',
  userEmail: 'user-email',
  defaultCustomer: 'default-customer',
};

const GENERAL_CONFIG_SECTIONS: [string, TGeneralConfigFieldName[]][] = [
  ['general-settings', ['apiKey', 'apiSecret', 'apiToken']],
  [
    'product-to-erkhet',
    [
      'costAccount',
      'salesAccount',
      'productCategoryCode',
      'consumeDescription',
    ],
  ],
  [
    'customer-to-erkhet',
    [
      'checkCompanyUrl',
      'customerDefaultName',
      'customerCategoryCode',
      'companyCategoryCode',
      'debtAccounts',
    ],
  ],
  ['loan-transaction-to-erkhet', ['userEmail', 'defaultCustomer']],
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
            {GENERAL_CONFIG_SECTIONS.map(([title, fieldNames]) => (
              <section key={title} className="rounded-lg border bg-background">
                <h2 className="border-b px-4 py-3 text-sm font-semibold">
                  {t(title)}
                </h2>
                <div className="grid gap-4 p-4 md:grid-cols-2">
                  {fieldNames.map((name) => (
                    <Form.Field
                      key={name}
                      name={name}
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>
                            {t(GENERAL_CONFIG_LABELS[name])}
                          </Form.Label>
                          <Form.Control>
                            <Input
                              placeholder={t(
                                `enter-${GENERAL_CONFIG_LABELS[name]}`,
                              )}
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
