import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import {
  Button,
  Collapsible,
  Form,
  getPluginAssetsUrl,
  Input,
  Skeleton,
  Spinner,
} from 'erxes-ui';
import { useGetConfigsByCodes } from '../hooks/useGetConfigsByCodes';
import { useConfigForm } from '../hooks/useConfigForm';
import { useUpdateConfigs } from '../hooks/useUpdateConfigs';
import { TMessageProConfig } from '../types';
import { useEffect, useMemo } from 'react';

export const MessageProConfigUpdateCollapse = () => {
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
              INTEGRATIONS[IntegrationType.MESSAGE_PRO].img,
            )}
            name={INTEGRATIONS[IntegrationType.MESSAGE_PRO].name}
          />
          Message Pro
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="shadow-xs rounded-lg p-3 bg-background">
        <MessageProConfigUpdate />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const MessageProConfigUpdate = () => {
  const { configs, loading } = useGetConfigsByCodes({
    variables: {
      codes: ['MESSAGE_PRO_API_KEY', 'MESSAGE_PRO_PHONE_NUMBER'],
    },
  });
  const configsData = useMemo(
    () =>
      Object.fromEntries(
        configs?.map((config) => [config.code, config.value]) ?? [],
      ) as TMessageProConfig,
    [configs],
  );

  const { updateConfig, loading: updating } = useUpdateConfigs();
  const { form } = useConfigForm();

  const onSubmit = async (data: TMessageProConfig) => {
    await updateConfig({
      variables: {
        configsMap: data,
      },
    });
  };

  useEffect(() => {
    if (configsData) {
      form.reset(configsData);
    }
  }, [configsData]);

  if (loading) {
    return <Skeleton className="w-full h-10" />;
  }
  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form
          className="text-sm text-muted-foreground space-y-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Form.Field
            control={form.control}
            name="MESSAGE_PRO_API_KEY"
            render={({ field }) => (
              <Form.Item className="flex flex-col gap-1">
                <Form.Label>MessagePro API Key</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="Enter Message Pro API Key" />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="MESSAGE_PRO_PHONE_NUMBER"
            render={({ field }) => (
              <Form.Item className="flex flex-col gap-1">
                <Form.Label>MessagePro phone number</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="MessagePro phone number" />
                </Form.Control>
              </Form.Item>
            )}
          />
          <div className="flex items-end justify-end">
            <Button disabled={updating} type="submit">
              {updating ? <Spinner /> : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
