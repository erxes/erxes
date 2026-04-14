import {
  Button,
  Form,
  InfoCard,
  Input,
  PhoneInput,
  Spinner,
  toast,
  Tabs
} from 'erxes-ui';
import { useCreateCustomerForm } from '../ticket/hooks/useCreateCustomerForm';
import { TCreateCustomerForm } from '../ticket/types';

import { AnimatePresence, motion } from 'motion/react';
import { SubmitHandler } from 'react-hook-form';
import { useCallback } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '@libs/utils';
import { useEditCustomer } from '../hooks/useEditCustomer';
import { messengerDataAtom } from '../states';
import { useAtom } from 'jotai';
import { useConnect } from '../hooks/useConnect';

export const NotifyCustomerForm = () => {
  const { form } = useCreateCustomerForm();
  const { control, handleSubmit, reset } = form;
  const { editCustomer, loading } = useEditCustomer();
  const [messengerData] = useAtom(messengerDataAtom);

  const customerId = getLocalStorageItem('customerId');

  const { connectMutation } = useConnect({
    integrationId: messengerData?.integrationId ?? '',
  });

  const onSubmit: SubmitHandler<TCreateCustomerForm> = useCallback(
    async (data) => {
      editCustomer({
        variables: {
          customerId,
          emails: [data.email],
          phones: [data.phone],
          firstName: data.firstName,
          lastName: data.lastName,
        },
        onCompleted: async (response) => {
          const customer = response.widgetsTicketCustomersEdit;
          setLocalStorageItem('erxes', JSON.stringify(customer));
          setLocalStorageItem('customerId', customer._id);

          if (messengerData?.integrationId && connectMutation) {
            await connectMutation({
              variables: {
                integrationId: messengerData?.integrationId ?? '',
                cachedCustomerId: customer._id,
                isUser: true,
              },
            });
          }

          reset();
          toast({
            title: 'Customer notified successfully',
            description: 'Customer notified successfully',
            variant: 'success',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    },
    [editCustomer, reset, messengerData?.integrationId, connectMutation],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 flex-1 overflow-y-auto styled-scroll p-3"
      >
        <InfoCard
          title="Enter your email or phone number"
          description="Please enter your email or phone number to continue"
        >
          <InfoCard.Content>
            <Form.Field
              control={control}
              name="type"
              render={({ field }) => (
                <Form.Item>
                  <Tabs
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  >
                    <Tabs.List className="w-full">
                      <Tabs.Trigger value="email" className="flex-1">
                        Email
                      </Tabs.Trigger>
                      <Tabs.Trigger value="phone" className="flex-1">
                        Phone
                      </Tabs.Trigger>
                    </Tabs.List>
                  </Tabs>
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="firstName"
              render={({ field }) => (
                <Form.Item>
                  <Input placeholder="First name" {...field} />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="lastName"
              render={({ field }) => (
                <Form.Item>
                  <Input placeholder="Last name" {...field} />
                </Form.Item>
              )}
            />
            <AnimatePresence mode="popLayout">
              {form.watch('type') === 'email' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Form.Field
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Email</Form.Label>
                        <Form.Control>
                          <Input type="email" placeholder="Email" {...field} />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="popLayout">
              {form.watch('type') === 'phone' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Form.Field
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control>
                          <PhoneInput
                            defaultCountry="MN"
                            className="bg-background"
                            {...field}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              type="submit"
              className="w-full self-end mt-auto"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Save'}
            </Button>
          </InfoCard.Content>
        </InfoCard>
      </form>
    </Form>
  );
};


