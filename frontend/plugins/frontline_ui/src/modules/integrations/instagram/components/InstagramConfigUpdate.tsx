import {
  Button,
  Collapsible,
  Dialog,
  Form,
  Input,
  Skeleton,
  Spinner,
  Textarea,
  useConfirm,
} from 'erxes-ui';
import { useInstagramUpdateConfigs } from '../hooks/useInstagramUpdateConfigs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { instagramConfigSchema } from '../constants/IgConfigSchema';
import { z } from 'zod';
import { useInstagramGetConfigs } from '../hooks/useInstagramGetConfigs';
import { useEffect } from 'react';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import { getPluginAssetsUrl } from 'erxes-ui';

export const InstagramConfigUpdateCollapse = () => {
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
              INTEGRATIONS[IntegrationType.INSTAGRAM_MESSENGER].img,
            )}
            name={INTEGRATIONS[IntegrationType.INSTAGRAM_MESSENGER].name}
          />
          Instagram
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="shadow-xs rounded-lg p-3 bg-background">
        <InstagramConfigUpdate />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const InstagramConfigUpdate = () => {
  const confirmationValue = 'update';
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue };
  const form = useForm<z.infer<typeof instagramConfigSchema>>({
    resolver: zodResolver(instagramConfigSchema),
    defaultValues: {
      INSTAGRAM_APP_ID: '',
      INSTAGRAM_APP_SECRET: '',
      INSTAGRAM_VERIFY_TOKEN: '',
      INSTAGRAM_PERMISSIONS: '',
    },
  });
  const { instagramConfigs, loading: loadingInstagramConfigs } =
    useInstagramGetConfigs();
  const { updateConfigs, loading } = useInstagramUpdateConfigs();

  useEffect(() => {
    if (!loadingInstagramConfigs) {
      form.reset(instagramConfigs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingInstagramConfigs]);

  const onSubmit = (data: z.infer<typeof instagramConfigSchema>) => {
    confirm({
      message: 'Are you sure you want to update the Instagram configs?',
      options: confirmOptions,
    }).then(() => {
      updateConfigs({ variables: { configsMap: data } });
    });
  };

  if (loadingInstagramConfigs) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
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
          name="INSTAGRAM_APP_ID"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Instagram App Id</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="INSTAGRAM_APP_SECRET"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Instagram App Secret</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="INSTAGRAM_VERIFY_TOKEN"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Instagram Verify Token</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="INSTAGRAM_PERMISSIONS"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>Instagram Permissions</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Dialog.Footer className="col-span-2 items-center">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'Save'}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
