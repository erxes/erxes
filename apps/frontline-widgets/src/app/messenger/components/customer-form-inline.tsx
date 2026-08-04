import { useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { type SubmitHandler } from 'react-hook-form';
import { Button, Form, Input, PhoneInput, Spinner, toast } from 'erxes-ui';
import { useEditCustomer } from '../hooks/useEditCustomer';
import { useCreateCustomerForm } from '../ticket/hooks/useCreateCustomerForm';
import { TCreateCustomerForm } from '../ticket/types';
import { useCustomerData } from '../hooks/useCustomerData';
import { useConnect } from '../hooks/useConnect';
import { useAtom, useAtomValue } from 'jotai';
import { customerDataAtom, messengerDataAtom } from '../states';
import { setLocalStorageItem } from '@libs/utils';
import { IconUser } from '@tabler/icons-react';

export const CustomerFormInline = () => {
  const { form } = useCreateCustomerForm();
  const { control, handleSubmit, reset, watch } = form;
  const { editCustomer, loading } = useEditCustomer();
  const { customerId } = useCustomerData();
  const messengerData = useAtomValue(messengerDataAtom);
  const [, setCustomerData] = useAtom(customerDataAtom);

  const { connectMutation } = useConnect({
    integrationId: messengerData?.integrationId ?? '',
  });

  const onSubmit: SubmitHandler<TCreateCustomerForm> = useCallback(
    async (data) => {
      if (!customerId) return;

      editCustomer({
        variables: {
          customerId,
          firstName: data.firstName,
          lastName: data.lastName,
          emails: data.email ? [data.email] : undefined,
          phones: data.phone ? [data.phone] : undefined,
        },
        onCompleted: async (response) => {
          const customer = response.widgetsTicketCustomersEdit;
          setLocalStorageItem('erxes', JSON.stringify(customer));
          setLocalStorageItem('customerId', customer._id);
          setCustomerData(customer);

          if (messengerData?.integrationId && connectMutation) {
            await connectMutation({
              variables: {
                integrationId: messengerData.integrationId,
                cachedCustomerId: customer._id,
                isUser: true,
              },
            });
          }

          reset();
          toast({
            title: 'Profile saved',
            description: 'You can now send messages.',
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
    [
      editCustomer,
      customerId,
      messengerData,
      connectMutation,
      setCustomerData,
      reset,
    ],
  );

  const contactType = watch('type');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="shrink-0 border-t border-border bg-background px-4 py-3"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="flex items-center justify-center size-6 rounded-full bg-primary/10">
          <IconUser className="size-3.5 text-primary" />
        </span>
        <p className="text-xs font-semibold text-foreground">
          Please provide your contact info to continue
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Form.Field
              control={control}
              name="firstName"
              render={({ field }) => (
                <Form.Item className="space-y-0">
                  <Form.Control>
                    <Input
                      placeholder="First name"
                      className="h-8 text-xs"
                      {...field}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="lastName"
              render={({ field }) => (
                <Form.Item className="space-y-0">
                  <Form.Control>
                    <Input
                      placeholder="Last name"
                      className="h-8 text-xs"
                      {...field}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>

          <div className="flex gap-1.5 items-center">
            <Form.Field
              control={control}
              name="type"
              render={({ field }) => (
                <Form.Item className="space-y-0 shrink-0">
                  <div className="flex rounded-md border border-input overflow-hidden text-xs h-8">
                    <button
                      type="button"
                      onClick={() => field.onChange('email')}
                      className={`px-2.5 transition-colors ${
                        field.value === 'email'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('phone')}
                      className={`px-2.5 transition-colors ${
                        field.value === 'phone'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Phone
                    </button>
                  </div>
                </Form.Item>
              )}
            />

            <div className="flex-1 min-w-0">
              <AnimatePresence mode="popLayout" initial={false}>
                {contactType === 'email' && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Form.Field
                      control={control}
                      name="email"
                      render={({ field }) => (
                        <Form.Item className="space-y-0">
                          <Form.Control>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              className="h-8 text-xs"
                              {...field}
                            />
                          </Form.Control>
                          <Form.Message className="text-xs mt-0.5" />
                        </Form.Item>
                      )}
                    />
                  </motion.div>
                )}

                {contactType === 'phone' && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Form.Field
                      control={control}
                      name="phone"
                      render={({ field }) => (
                        <Form.Item className="space-y-0">
                          <Form.Control>
                            <PhoneInput
                              defaultCountry="MN"
                              className="bg-background h-8 text-xs"
                              {...field}
                            />
                          </Form.Control>
                          <Form.Message className="text-xs mt-0.5" />
                        </Form.Item>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="shrink-0 h-8 px-3 text-xs"
            >
              {loading ? <Spinner size="sm" /> : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};
