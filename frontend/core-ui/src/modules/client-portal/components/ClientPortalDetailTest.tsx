import { InfoCard, Input, Form, Button, formatPhoneNumber } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CLIENTPORTAL_TEST_SCHEMA } from '../constants/clientPortalEditSchema';

export const ClientPortalDetailTest = () => {
  const form = useForm<z.infer<typeof CLIENTPORTAL_TEST_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_TEST_SCHEMA),
    defaultValues: {
      testUserEmail: '',
      testUserPhone: '',
      testUserPassword: '',
      testUserOTP: '',
    },
  });

  const onSubmit = (data: z.infer<typeof CLIENTPORTAL_TEST_SCHEMA>) => {
    console.log(data);
  };

  return (
    <InfoCard title="Test Account">
      <InfoCard.Content>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Form.Field
              control={form.control}
              name="testUserEmail"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Email</Form.Label>
                  <Input {...field} />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="testUserPhone"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Phone</Form.Label>
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
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="testUserPassword"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Password</Form.Label>
                  <Input {...field} />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="testUserOTP"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>OTP</Form.Label>
                  <Input {...field} />
                </Form.Item>
              )}
            />
            <Button
              type="submit"
              className="mt-2"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </Form>
      </InfoCard.Content>
    </InfoCard>
  );
};
