import { Button, Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSyncErkhetGeneralConfig } from '@/erkhet-sync/settings/general-config/hooks/useSyncErkhetGeneralConfig';

export const SyncErkhetGeneralConfigForm = () => {
  const { form, handleUpdate, isUpdating } = useSyncErkhetGeneralConfig();
  const { t } = useTranslation('mongolian');

  const onSubmit = async (formData: any) => {
    await handleUpdate(formData);
  };

  return (
    <Form {...form}>
      <form
        className="h-full w-full mx-auto max-w-4xl px-9 py-5 flex flex-col gap-8 overflow-y-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold mb-2">{t('general-settings', 'General Settings')}</h1>
          <Form.Field
            name="apiKey"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('api-key', 'Api Key')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-api-key', 'Enter api key')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="apiSecret"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('api-secret', 'Api Secret')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-api-secret', 'Enter api secret')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="apiToken"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('api-token', 'Api Token')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-api-token', 'Enter api token')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold mb-2">{t('product-to-erkhet', 'Product to Erkhet')}</h1>
          <Form.Field
            name="costAccount"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('cost-account', 'Cost Account')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-cost-account', 'Enter cost account')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="salesAccount"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('sales-account', 'Sales Account')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-sales-account', 'Enter sales account')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="productCategoryCode"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('product-category-code', 'Product Category Code')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-product-category-code', 'Enter product category code')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="consumeDescription"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('consume-products-description', 'Consume Products Description')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-consume-products-description', 'Enter consume products description')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold mb-2">{t('customer-to-erkhet', 'Customer to Erkhet')}</h1>
          <Form.Field
            name="checkCompanyUrl"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('check-company-url', 'Check Company URL')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-check-company-url', 'Enter check company url')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="customerDefaultName"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('customer-default-name', 'Customer Default Name')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-customer-default-name', 'Enter customer default name')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="customerCategoryCode"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('customer-category-code', 'Customer Category Code')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-customer-category-code', 'Enter customer category code')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="companyCategoryCode"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('company-category-code', 'Company Category Code')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-company-category-code', 'Enter company category code')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="debtAccounts"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('debt-accounts', 'Debt Accounts')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-debt-accounts', 'Enter debt accounts')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold mb-2">
            {t('loan-transaction-to-erkhet', 'Loan Transaction to Erkhet')}
          </h1>
          <Form.Field
            name="userEmail"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('user-email', 'User Email')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-user-email', 'Enter user email')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="defaultCustomer"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('default-customer', 'Default Customer')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-default-customer', 'Enter default customer')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>

        <div className="text-right">
          <Button
            className="justify-self-end flex-none"
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? t('saving', 'Saving...') : t('save', 'Save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
