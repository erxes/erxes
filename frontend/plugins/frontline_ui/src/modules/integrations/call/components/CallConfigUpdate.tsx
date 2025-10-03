import {
  Collapsible,
  Dialog,
  Form,
  getPluginAssetsUrl,
  Input,
  Skeleton,
} from 'erxes-ui';
import { Button } from 'erxes-ui';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CALL_CONFIG_SCHEMA } from '@/integrations/call/constants/callConfigSchema';
import { useCallGetConfigs } from '@/integrations/call/hooks/useCallGetConfigs';
import { useEffect } from 'react';
import { useCallUpdateConfigs } from '@/integrations/call/hooks/useCallUpdateConfigs';

export const CallConfigUpdateCollapse = () => {
  return (
    <Collapsible className="w-full bg-muted rounded-lg">
      <Collapsible.Trigger asChild>
        <Button
          variant="secondary"
          className="w-full h-auto flex justify-start group bg-transparent hover:bg-transparent gap-3 px-3 font-semibold"
        >
          <Collapsible.TriggerIcon className="text-accent-foreground" />
          <IntegrationLogo
            img={getPluginAssetsUrl(
              'frontline',
              INTEGRATIONS[IntegrationType.CALL].img,
            )}
            name={INTEGRATIONS[IntegrationType.CALL].name}
          />
          Call
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="shadow-xs rounded-lg p-3 bg-background">
        <CallConfigUpdate />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const CallConfigUpdate = () => {
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
    });
  };

  if (loadingUpdate) {
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
              <Form.Label>STUN Server URL</Form.Label>
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
              <Form.Label>TURN Server URL</Form.Label>
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
              <Form.Label>TURN Server Username</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="TURN_SERVER_CREDENTIAL"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>TURN Server Credential</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Dialog.Footer className="col-span-2 items-center">
          <Button type="submit" disabled={loadingUpdate}>
            Save
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
