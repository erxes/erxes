import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, InfoCard, Spinner, Switch, Textarea } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CLIENTPORTAL_FIREBASE_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { IClientPortal } from '@/client-portal/types/clientPortal';
import { useUpdateClientPortal } from '@/client-portal/hooks/useUpdateClientPortal';

interface Props {
  clientPortal?: IClientPortal | null;
}

export function ClientPortalDetailFirebase({ clientPortal }: Props) {
  const form = useForm<z.infer<typeof CLIENTPORTAL_FIREBASE_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_FIREBASE_SCHEMA),
    defaultValues: {
      enabled: clientPortal?.firebaseConfig?.enabled ?? false,
      serviceAccountKey: clientPortal?.firebaseConfig?.serviceAccountKey ?? '',
    },
  });

  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(values: z.infer<typeof CLIENTPORTAL_FIREBASE_SCHEMA>) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          firebaseConfig: {
            enabled: values.enabled,
            serviceAccountKey: values.serviceAccountKey?.trim() || undefined,
          },
        },
      },
    });
  }

  return (
    <InfoCard title="Firebase Configuration">
      <InfoCard.Content>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <Form.Field
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-2">
                    <Form.Control>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label variant="peer">
                      Enable push notifications (Firebase)
                    </Form.Label>
                  </div>
                  <Form.Description>
                    Send push notifications to client portal users via FCM
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="serviceAccountKey"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Service account key</Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      placeholder='{"type":"service_account",...}'
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </Form.Control>
                  <Form.Description>
                    Paste the JSON from Firebase Console → Project settings →
                    Service accounts → Generate new private key
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button
              type="submit"
              variant="secondary"
              className="mt-2"
              disabled={loading}
            >
              {loading && <Spinner containerClassName="w-auto flex-none" />}
              Save
            </Button>
          </form>
        </Form>
      </InfoCard.Content>
    </InfoCard>
  );
}
