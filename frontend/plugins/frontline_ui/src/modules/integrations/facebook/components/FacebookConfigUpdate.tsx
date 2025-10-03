import {
  Button,
  Collapsible,
  Dialog,
  Form,
  Input,
  Skeleton,
  Textarea,
} from 'erxes-ui';
import { useFacebookUpdateConfigs } from '../hooks/useFacebookUpdateConfigs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { facebookConfigSchema } from '../constants/FbConfigSchema';
import { z } from 'zod';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import { useFacebookGetConfigs } from '../hooks/useFacebookGetConfigs';
import { useEffect } from 'react';
import { getPluginAssetsUrl } from 'erxes-ui';

export const FacebookConfigUpdateCollapse = () => {
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
              INTEGRATIONS[IntegrationType.FACEBOOK_MESSENGER].img,
            )}
            name={INTEGRATIONS[IntegrationType.FACEBOOK_MESSENGER].name}
          />
          Facebook
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="shadow-xs rounded-lg p-3 bg-background">
        <FacebookConfigUpdate />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const FacebookConfigUpdate = () => {
  const form = useForm<z.infer<typeof facebookConfigSchema>>({
    resolver: zodResolver(facebookConfigSchema),
    defaultValues: {
      FACEBOOK_APP_ID: '',
      FACEBOOK_APP_SECRET: '',
      FACEBOOK_VERIFY_TOKEN: '',
      FACEBOOK_PERMISSIONS: '',
    },
  });
  const { facebookConfigs, loading: loadingFacebookConfigs } =
    useFacebookGetConfigs();

  const { updateConfigs, loading } = useFacebookUpdateConfigs();

  useEffect(() => {
    if (!loadingFacebookConfigs) {
      form.reset(facebookConfigs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingFacebookConfigs]);

  const onSubmit = (data: z.infer<typeof facebookConfigSchema>) => {
    updateConfigs({
      variables: {
        configsMap: data,
      },
    });
  };

  if (loadingFacebookConfigs) {
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
          name="FACEBOOK_APP_ID"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Facebook App Id</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="FACEBOOK_APP_SECRET"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Facebook App Secret</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="FACEBOOK_VERIFY_TOKEN"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Facebook Verify Token</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="FACEBOOK_PERMISSIONS"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>Facebook Permissions</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Dialog.Footer className="col-span-2 items-center">
          <Button type="submit" disabled={loading}>
            Save
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
