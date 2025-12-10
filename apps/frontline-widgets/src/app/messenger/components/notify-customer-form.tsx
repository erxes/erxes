import {
  Button,
  Combobox,
  Command,
  Form,
  InfoCard,
  Input,
  PhoneInput,
  Popover,
  Spinner,
  toast,
} from 'erxes-ui';
import { useCreateCustomerForm } from '../ticket/hooks/useCreateCustomerForm';
import { TCreateCustomerForm } from '../ticket/types';
import { IconPhone, IconMail, IconUserShare } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { SubmitHandler } from 'react-hook-form';
import { useCallback, useState } from 'react';
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
                  <SelectContactType
                    value={field.value}
                    onChange={field.onChange}
                  />
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

export const SelectContactType = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const handleValueChange = (value: string) => {
    onChange(value);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.TriggerBase className="w-fit h-7 font-medium max-w-64">
          {!value ? (
            <span className="flex items-center gap-2 text-accent-foreground">
              <IconUserShare className="size-4" />
              Select contact type
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {value === 'email' ? (
                <IconMail className="size-4" />
              ) : (
                <IconPhone className="size-4" />
              )}
              {value === 'email' ? 'Email' : 'Phone'}
            </span>
          )}
        </Combobox.TriggerBase>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Command.Item
              value="email"
              onSelect={() => handleValueChange('email')}
            >
              <IconMail className="size-4" />
              Email
            </Command.Item>
            <Command.Item
              value="phone"
              onSelect={() => handleValueChange('phone')}
            >
              <IconPhone className="size-4" />
              Phone
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
