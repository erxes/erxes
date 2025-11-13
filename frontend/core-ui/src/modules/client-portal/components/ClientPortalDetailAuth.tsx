import { CLIENTPORTAL_AUTH_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button, Spinner, InfoCard, ToggleGroup, Input } from 'erxes-ui';
import { z } from 'zod';
import { useUpdateClientPortal } from '@/client-portal/hooks/useUpdateClientPortal';
import { IClientPortal } from '../types/clientPortal';

export const ClientPortalDetailAuth = ({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) => {
  const form = useForm<z.infer<typeof CLIENTPORTAL_AUTH_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_AUTH_SCHEMA),
    defaultValues: {
      tokenPassMethod: clientPortal?.tokenPassMethod ?? 'cookie',
      tokenExpiration: clientPortal?.tokenExpiration ?? 1,
      refreshTokenExpiration: clientPortal?.refreshTokenExpiration ?? 1,
    },
  });

  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(data: z.infer<typeof CLIENTPORTAL_AUTH_SCHEMA>) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          tokenPassMethod: data.tokenPassMethod,
          tokenExpiration: data.tokenExpiration,
          refreshTokenExpiration: data.refreshTokenExpiration,
        },
      },
    });
  }

  return (
    <InfoCard title="Authentication Token">
      <InfoCard.Content className="gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-6"
          >
            <Form.Field
              control={form.control}
              name="tokenPassMethod"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="block">Token Pass Method</Form.Label>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                    className="inline-flex"
                  >
                    <ToggleGroup.Item value="header" className="flex-auto">
                      Header
                    </ToggleGroup.Item>
                    <ToggleGroup.Item value="cookie" className="flex-auto">
                      Cookie
                    </ToggleGroup.Item>
                  </ToggleGroup>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="tokenExpiration"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Token expiration duration (days)</Form.Label>
                    <Input
                      type="number"
                      min={1}
                      max={7}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="refreshTokenExpiration"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      Refresh Token expiration duration (days)
                    </Form.Label>
                    <Input
                      type="number"
                      min={1}
                      max={7}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  loading ||
                  form.formState.isSubmitting ||
                  !form.formState.isDirty
                }
              >
                {loading && <Spinner />}
                Update
              </Button>
            </div>
          </form>
        </Form>
      </InfoCard.Content>
    </InfoCard>
  );
};
