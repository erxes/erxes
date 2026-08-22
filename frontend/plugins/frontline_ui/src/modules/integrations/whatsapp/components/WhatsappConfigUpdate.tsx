import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Collapsible,
  Dialog,
  Form,
  getPluginAssetsUrl,
  Input,
  Skeleton,
  Spinner,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { whatsappConfigSchema } from '../constants/whatsappConfigSchema';
import { useWhatsappGetConfigs } from '../hooks/useWhatsappGetConfigs';
import { useWhatsappUpdateConfigs } from '../hooks/useWhatsappUpdateConfigs';

export const WhatsappConfigUpdateCollapse = () => {
  return (
    <Collapsible className="w-full bg-muted rounded-lg">
      <Collapsible.Trigger asChild>
        <Button
          variant="secondary"
          className="w-full h-auto flex justify-start group bg-transparent hover:bg-transparent gap-3 px-3 font-semibold"
        >
          <Collapsible.TriggerIcon className="text-accent-foreground" />
          <IntegrationLogo
            img={getPluginAssetsUrl('frontline', 'whatsapp.webp')}
            name="WhatsApp"
          />
          WhatsApp
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="shadow-xs rounded-lg p-3 bg-background">
        <WhatsappConfigUpdate />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const WhatsappConfigUpdate = () => {
  const confirmationValue = 'update';
  const { confirm } = useConfirm();
  const form = useForm<z.infer<typeof whatsappConfigSchema>>({
    resolver: zodResolver(whatsappConfigSchema),
    defaultValues: {
      WHATSAPP_VERIFY_TOKEN: '',
    },
  });

  const { whatsappConfigs, loading: loadingWhatsappConfigs } =
    useWhatsappGetConfigs();
  const { updateConfigs, loading } = useWhatsappUpdateConfigs();

  useEffect(() => {
    if (!loadingWhatsappConfigs) {
      form.reset(whatsappConfigs);
    }
  }, [form, loadingWhatsappConfigs, whatsappConfigs]);

  const onSubmit = (data: z.infer<typeof whatsappConfigSchema>) => {
    confirm({
      message: 'Are you sure you want to update the WhatsApp configs?',
      options: { confirmationValue },
    }).then(() => {
      updateConfigs({
        variables: {
          configsMap: data,
        },
        onCompleted: () => {
          toast({
            title: 'WhatsApp configs updated successfully',
            variant: 'success',
          });
        },
      });
    });
  };

  if (loadingWhatsappConfigs) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <Form.Field
          name="WHATSAPP_VERIFY_TOKEN"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Verify Token</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Description>
                Used by Meta to verify the WhatsApp webhook. Connect WhatsApp
                from a channel's integration list instead of entering account
                credentials here.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Dialog.Footer className="items-center">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'Save'}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
