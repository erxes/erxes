import { CLIENT_PORTAL_SEND_NOTIFICATION } from '@/contacts/client-portal-users/graphql/clientPortalSendNotification';
import { GET_CLIENT_PORTAL_NOTIFICATIONS_BY_CP_USER_ID } from '@/contacts/client-portal-users/graphql/getClientPortalNotificationsByCpUserId';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  Form,
  Input,
  Select,
  Spinner,
  Textarea,
  toast,
} from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const NOTIFICATION_TYPE_VALUES = ['INFO', 'SUCCESS', 'WARNING', 'ERROR'] as const;
const NOTIFICATION_PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const CP_NOTIFICATION_SEND_SCHEMA = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(NOTIFICATION_TYPE_VALUES).optional().default('INFO'),
  priority: z.enum(NOTIFICATION_PRIORITY_VALUES).optional().default('MEDIUM'),
});

type CPNotificationSendForm = z.infer<typeof CP_NOTIFICATION_SEND_SCHEMA>;

interface CPUserDetailSendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cpUserId: string;
  clientPortalId: string;
}

export function CPUserDetailSendNotificationDialog({
  open,
  onOpenChange,
  cpUserId,
  clientPortalId,
}: CPUserDetailSendNotificationDialogProps) {
  const { t } = useTranslation('contact', {
    keyPrefix: 'clientPortalUser.detail.sendNotification',
  });

  const [clientPortalSendNotification, { loading }] = useMutation(
    CLIENT_PORTAL_SEND_NOTIFICATION,
    {
      refetchQueries: [
        {
          query: GET_CLIENT_PORTAL_NOTIFICATIONS_BY_CP_USER_ID,
          variables: {
            cpUserId,
            limit: 20,
            direction: 'forward',
            status: 'ALL',
          },
        },
      ],
    },
  );

  const form = useForm<CPNotificationSendForm>({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      message: '',
      type: 'INFO',
      priority: 'MEDIUM',
    },
    resolver: zodResolver(CP_NOTIFICATION_SEND_SCHEMA),
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = (data: CPNotificationSendForm) => {
    clientPortalSendNotification({
      variables: {
        cpUserId,
        clientPortalId,
        input: {
          title: data.title.trim(),
          message: data.message.trim(),
          type: data.type,
          priority: data.priority,
          kind: 'USER',
        },
      },
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
      onCompleted: () => {
        toast({
          title: t('success', {
            defaultValue: 'Notification sent',
          }),
          variant: 'success',
        });
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('title', { defaultValue: 'Send notification' })}
          description={t('description', {
            defaultValue: 'Send a notification to this client portal user',
          })}
        />
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="flex flex-col gap-3 mb-3">
              <Form.Field
                control={control}
                name="title"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('titleLabel', { defaultValue: 'Title' })}
                    </Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder={t('titlePlaceholder', {
                          defaultValue: 'Notification title',
                        })}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name="message"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('messageLabel', { defaultValue: 'Message' })}
                    </Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder={t('messagePlaceholder', {
                          defaultValue: 'Notification message',
                        })}
                        rows={3}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name="type"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('typeLabel', { defaultValue: 'Type' })}
                    </Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {NOTIFICATION_TYPE_VALUES.map((value) => (
                            <Select.Item key={value} value={value}>
                              {value.charAt(0) + value.slice(1).toLowerCase()}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name="priority"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('priorityLabel', { defaultValue: 'Priority' })}
                    </Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {NOTIFICATION_PRIORITY_VALUES.map((value) => (
                            <Select.Item key={value} value={value}>
                              {value.charAt(0) + value.slice(1).toLowerCase()}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </fieldset>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Spinner />
                ) : (
                  t('send', { defaultValue: 'Send notification' })
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
}
