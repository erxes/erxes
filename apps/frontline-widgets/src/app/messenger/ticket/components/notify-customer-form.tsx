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
import { useCreateCustomerForm } from '../hooks/useCreateCustomerForm';
import { useNotifyCustomer } from '../hooks/useNotifyCustomer';
import { TCreateCustomerForm } from '../types';
import { IconPhone, IconMail, IconUserShare } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { SubmitHandler } from 'react-hook-form';
import { useCallback, useState } from 'react';
import {
  getVisitorId,
  setLocalStorageItem,
  getErxesSettings,
} from '@libs/utils';
import { useAtom, useSetAtom } from 'jotai';
import {
  customerIdAtom,
  integrationIdAtom,
  connectionAtom,
  ticketConfigAtom,
  uiOptionsAtom,
} from '../../states';
import { useMutation } from '@apollo/client';
import { connect } from '../../graphql/mutations';
import {
  IConnectionInfo,
  ITicketConfig,
  IWidgetUiOptions,
} from '../../types/connection';
import { applyUiOptionsToTailwind } from '@libs/tw-utils';

export const NotifyCustomerForm = ({
  onSuccess,
}: {
  onSuccess: () => void;
}) => {
  const { form } = useCreateCustomerForm();
  const [customerId, setCustomerId] = useAtom(customerIdAtom);
  const [integrationId] = useAtom(integrationIdAtom);
  const setConnection = useSetAtom(connectionAtom);
  const setTicketConfig = useSetAtom(ticketConfigAtom);
  const setUiOptions = useSetAtom(uiOptionsAtom);
  const { control, handleSubmit, reset } = form;
  const { saveCustomerNotified, loading } = useNotifyCustomer();

  const [connectMutation] = useMutation(connect(false), {
    onCompleted: (response) => {
      const connectionData = response?.widgetsMessengerConnect;
      if (connectionData) {
        setConnection((prev: IConnectionInfo) => ({
          ...prev,
          widgetsMessengerConnect: {
            ...prev.widgetsMessengerConnect,
            visitorId: connectionData.visitorId,
            customerId: connectionData.customerId,
            messengerData: connectionData.messengerData,
            uiOptions: connectionData.uiOptions,
          },
        }));
        setUiOptions(connectionData.uiOptions as IWidgetUiOptions);
        setTicketConfig(connectionData.ticketConfig as ITicketConfig);
        if (connectionData.uiOptions) {
          applyUiOptionsToTailwind(connectionData.uiOptions);
        }
      }
    },
  });

  const handleConnect = useCallback(
    async (newCustomerId: string) => {
      if (!integrationId) return;

      const visitorId = await getVisitorId();
      const erxesSettings = getErxesSettings();
      const messengerSettings = erxesSettings?.messenger;
      const { email, phone, code, data, companyData } = messengerSettings || {};

      const variables = email
        ? {
            integrationId,
            visitorId: null,
            cachedCustomerId: newCustomerId,
            email,
            isUser: true,
            phone,
            code,
            data,
            companyData,
          }
        : {
            integrationId,
            visitorId,
            cachedCustomerId: newCustomerId,
            isUser: false,
          };

      await connectMutation({ variables });
    },
    [integrationId, connectMutation],
  );

  const onSubmit: SubmitHandler<TCreateCustomerForm> = useCallback(
    async (data) => {
      const visitorId = await getVisitorId();
      if (!visitorId) {
        return;
      }
      saveCustomerNotified({
        variables: {
          ...data,
          visitorId,
          customerId: null,
        },
        onCompleted: async (response) => {
          const customer = response.widgetsSaveCustomerGetNotified;
          setLocalStorageItem('erxes', JSON.stringify(customer));
          setLocalStorageItem('customerId', customer._id);
          setCustomerId(customer._id ?? null);

          try {
            await handleConnect(customer._id);
          } catch (error) {
            toast({
              title: 'Connection error',
              description:
                error instanceof Error ? error.message : 'Failed to connect',
              variant: 'destructive',
            });
            return;
          }

          reset();
          toast({
            title: 'Customer notified successfully',
            description: 'Customer notified successfully',
            variant: 'success',
          });
          onSuccess();
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
    [saveCustomerNotified, reset, handleConnect, setCustomerId, onSuccess],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 flex-1 overflow-y-auto styled-scroll p-3"
      >
        <InfoCard
          title="Get started"
          description="Please select the type of contact you want to notify"
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
                    name="value"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Email</Form.Label>
                        <Form.Control>
                          <Input type="email" placeholder="Email" {...field} />
                        </Form.Control>
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
                    name="value"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control>
                          <PhoneInput className="bg-background" {...field} />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </InfoCard.Content>
        </InfoCard>
        <Button
          type="submit"
          className="w-full self-end mt-auto"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : 'Save'}
        </Button>
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
