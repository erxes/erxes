import {
  InfoCard,
  Input,
  Form,
  Button,
  formatPhoneNumber,
  Spinner,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CLIENTPORTAL_TEST_SCHEMA } from '../constants/clientPortalEditSchema';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';

type ClientPortalTestFormValues = z.infer<typeof CLIENTPORTAL_TEST_SCHEMA>;

export const ClientPortalDetailTest = ({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) => {
  const form = useForm<ClientPortalTestFormValues>({
    resolver: zodResolver(CLIENTPORTAL_TEST_SCHEMA),
    defaultValues: {
      testUserEnabled: clientPortal?.testUser?.enableTestUser ?? false,
      testUserEmail: clientPortal?.testUser?.email ?? '',
      testUserPhone: clientPortal?.testUser?.phone ?? '',
      testUserPassword: clientPortal?.testUser?.password ?? '',
      testUserOTP:
        clientPortal?.testUser?.otp && typeof clientPortal.testUser.otp === 'string'
          ? clientPortal.testUser.otp
          : undefined,
    },
  });

  const { updateClientPortal, loading } = useUpdateClientPortal();

  const onSubmit = (data: ClientPortalTestFormValues) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          testUser: {
            enableTestUser: data.testUserEnabled,
            email: data.testUserEmail,
            phone: data.testUserPhone,
            password: data.testUserPassword,
              otp: data.testUserOTP,
          },
        },
      },
    });
  };

  return (
    <InfoCard title="Test Account">
      <InfoCard.Content>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Form.Field
              control={form.control}
              name="testUserEnabled"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Enable test user</Form.Label>
                  <Form.Control>
                    <input
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="testUserEmail"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Email</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="testUserPhone"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control>
                    <Input
                      value={
                        field.value
                          ? formatPhoneNumber({
                              value: field.value,
                              defaultCountry: 'MN',
                            })
                          : ''
                      }
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="testUserPassword"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Password</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="testUserOTP"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>OTP</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button
              type="submit"
              className="mt-2"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              {loading && <Spinner containerClassName="w-auto flex-none" />}
              Save
            </Button>
          </form>
        </Form>
      </InfoCard.Content>
    </InfoCard>
  );
};
