import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useLoyaltyConfig } from '../hooks/useLoyaltyConfig';

export const LoyaltyConfigFormFields = () => {
  const { form, handleUpdate, isUpdating, isLoading } = useLoyaltyConfig();

  const onSubmit = async (formData: any) => {
    await handleUpdate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="h-full w-full mx-auto max-w-2xl px-9 py-5 flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-lg font-semibold">General settings</h1>

        <Form.Field
          name="loyaltyRatioCurrency"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                Loyalty ratio currency
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter loyalty ratio currency"
                  className="h-8"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <h1 className="text-lg font-semibold">Share settings</h1>
        <Form.Field
          name="feeForScoreSharing"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                Fee for score sharing
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter fee for score sharing"
                  className="h-8"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

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
