import { CALL_CONFIG_SCHEMA } from '@/integrations/call/constants/callConfigSchema';
import { useCallGetConfigs } from '@/integrations/call/hooks/useCallGetConfigs';
import { useCallUpdateConfigs } from '@/integrations/call/hooks/useCallUpdateConfigs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  Form,
  Input,
  Skeleton,
  Spinner,
  toast,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SecretInput } from '@/integrations/components/SecretInput';

export const CallConfigUpdate = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const form = useForm<z.infer<typeof CALL_CONFIG_SCHEMA>>({
    resolver: zodResolver(CALL_CONFIG_SCHEMA),
    defaultValues: {
      STUN_SERVER_URL: '',
      TURN_SERVER_URL: '',
      TURN_SERVER_USERNAME: '',
      TURN_SERVER_CREDENTIAL: '',
    },
  });

  const { callConfigs, loading } = useCallGetConfigs();

  const { updateConfigs, loading: loadingUpdate } = useCallUpdateConfigs();

  useEffect(() => {
    if (!loading) {
      form.reset(callConfigs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const onSubmit = (data: z.infer<typeof CALL_CONFIG_SCHEMA>) => {
    updateConfigs({
      variables: {
        configsMap: data,
      },
      onCompleted: () => {
        toast({
          title: t('call-configs-updated'),
          variant: 'success',
        });
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8" />
        <Skeleton className="h-8 " />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-3"
      >
        <Form.Field
          name="STUN_SERVER_URL"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('stun-server-url')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="TURN_SERVER_URL"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('turn-server-url')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="TURN_SERVER_USERNAME"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('turn-server-username')}</Form.Label>
              <Form.Control>
                <SecretInput {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="TURN_SERVER_CREDENTIAL"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('turn-server-credential')}</Form.Label>
              <Form.Control>
                <SecretInput {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Dialog.Footer className="col-span-2 items-center">
          <Button type="submit" disabled={loadingUpdate}>
            {loadingUpdate ? <Spinner /> : t('save')}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
