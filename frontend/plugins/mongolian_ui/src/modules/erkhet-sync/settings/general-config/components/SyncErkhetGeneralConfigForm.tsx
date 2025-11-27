import { Button, Form, Input } from 'erxes-ui';
import { useSyncErkhetGeneralConfig } from '@/erkhet-sync/settings/general-config/hooks/useSyncErkhetGeneralConfig';

export const SyncErkhetGeneralConfigForm = () => {
  const { form, handleUpdate, isUpdating } = useSyncErkhetGeneralConfig();

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
          <h1 className="text-xl font-semibold mb-2">General settings</h1>
          <Form.Field
            name="ApiKey"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Api key</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter api key"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="ApiSecret"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Api secret</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter api secret"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="ApiToken"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Api token</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter api token"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="GetRemainderUrl"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Get remainder url</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter get remainder url"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold mb-2">Product to erkhet</h1>
          <Form.Field
            name="costAccount"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Cost account</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter cost account"
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
                <Form.Label>Sales account</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter sales account"
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
                <Form.Label>Product category code</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter product category code"
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
                <Form.Label>Consume products description</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter consume products description"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold mb-2">Customer to erkhet</h1>
          <Form.Field
            name="checkCompanyUrl"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Check company url</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter check company url"
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
                <Form.Label>Customer default name</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter customer default name"
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
                <Form.Label>Customer category code</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter customer category code"
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
                <Form.Label>Company category code</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter company category code"
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
                <Form.Label>Debt accounts</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter debt accounts"
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
            Loan transaction to erkhet
          </h1>
          <Form.Field
            name="userEmail"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>User email</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter user email"
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
                <Form.Label>Default customer</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    placeholder="Enter default customer"
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
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
