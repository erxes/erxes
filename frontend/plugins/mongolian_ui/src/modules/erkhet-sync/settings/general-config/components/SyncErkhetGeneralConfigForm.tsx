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
          <h1 className="text-xl font-semibold mb-2">{t('general-settings')}</h1>
          <Form.Field
            name="apiKey"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('api-key')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-api-key')}
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
                <Form.Label>{t('api-secret')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-api-secret')}
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
                <Form.Label>{t('api-token')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-api-token')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold mb-2">{t('product-to-erkhet')}</h1>
          <Form.Field
            name="costAccount"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('cost-account')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-cost-account')}
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
                <Form.Label>{t('sales-account')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-sales-account')}
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
                <Form.Label>{t('product-category-code')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-product-category-code')}
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
                <Form.Label>{t('consume-products-description')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-consume-products-description')}
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold mb-2">{t('customer-to-erkhet')}</h1>
          <Form.Field
            name="checkCompanyUrl"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('check-company-url')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-check-company-url')}
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
                <Form.Label>{t('customer-default-name')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-customer-default-name')}
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
                <Form.Label>{t('customer-category-code')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-customer-category-code')}
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
                <Form.Label>{t('company-category-code')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-company-category-code')}
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
                <Form.Label>{t('debt-accounts')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-debt-accounts')}
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
            {t('loan-transaction-to-erkhet')}
          </h1>
          <Form.Field
            name="userEmail"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('user-email')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-user-email')}
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
                <Form.Label>{t('default-customer')}</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder={t('enter-default-customer')}
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
            {isUpdating ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
