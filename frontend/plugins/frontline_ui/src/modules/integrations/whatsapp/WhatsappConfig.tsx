import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCopy } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  Form,
  Input,
  Skeleton,
  Spinner,
  getPluginAssetsUrl,
  toast,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { SecretInput } from '@/integrations/components/SecretInput';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import {
  WHATSAPP_CONFIG,
  WHATSAPP_UPDATE_CONFIG,
  WhatsappConfig,
} from './graphql';
import { WhatsappTranslationKey, useWhatsappTranslation } from './translations';

const NUMERIC_ID = /^\d+$/;

export const getWhatsappConfigSchema = (
  t: (key: WhatsappTranslationKey) => string,
  hasAppSecret: boolean,
) =>
  z.object({
    appId: z.string().trim().regex(NUMERIC_ID, t('numericId')),
    appSecret: z
      .string()
      .trim()
      .refine((value) => hasAppSecret || value.length > 0, {
        message: t('appSecretRequired'),
      }),
    configId: z.string().trim().regex(NUMERIC_ID, t('numericId')),
    verifyToken: z.string().trim(),
  });

type ConfigValues = z.infer<ReturnType<typeof getWhatsappConfigSchema>>;

const CopyField = ({ value }: { value: string }) => {
  const { t } = useWhatsappTranslation();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: t('copied'), variant: 'success' });
    } catch {
      toast({ title: t('copyFailed'), variant: 'destructive' });
    }
  };

  return (
    <div className="flex gap-2">
      <Input value={value} readOnly className="font-mono" />
      <Button type="button" variant="outline" onClick={() => void copy()}>
        <IconCopy />
        {t('copy')}
      </Button>
    </div>
  );
};

const WhatsappConfigForm = ({ config }: { config: WhatsappConfig }) => {
  const { t } = useWhatsappTranslation();
  const [updateConfig, { loading }] = useMutation(WHATSAPP_UPDATE_CONFIG, {
    refetchQueries: ['frontlineWhatsappConfig'],
  });
  const form = useForm<ConfigValues>({
    resolver: zodResolver(getWhatsappConfigSchema(t, config.hasAppSecret)),
    defaultValues: {
      appId: config.appId,
      appSecret: '',
      configId: config.configId,
      verifyToken: config.verifyToken,
    },
  });

  useEffect(() => {
    form.reset({
      appId: config.appId,
      appSecret: '',
      configId: config.configId,
      verifyToken: config.verifyToken,
    });
  }, [config, form]);

  const submit = (values: ConfigValues) => {
    updateConfig({
      variables: {
        appId: values.appId,
        configId: values.configId,
        appSecret: values.appSecret || undefined,
        verifyToken: values.verifyToken || undefined,
      },
      onCompleted: () => toast({ title: t('saved'), variant: 'success' }),
      onError: (error) =>
        toast({
          title: t('saveFailed'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="grid grid-cols-2 gap-3"
      >
        <Form.Field
          control={form.control}
          name="appId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('appId')}</Form.Label>
              <Form.Control>
                <Input {...field} inputMode="numeric" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="appSecret"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('appSecret')}</Form.Label>
              <Form.Control>
                <SecretInput {...field} />
              </Form.Control>
              {config.hasAppSecret && (
                <Form.Description>{t('appSecretSaved')}</Form.Description>
              )}
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="configId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('configId')}</Form.Label>
              <Form.Control>
                <Input {...field} inputMode="numeric" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="verifyToken"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('verifyToken')}</Form.Label>
              <Form.Control>
                <SecretInput {...field} />
              </Form.Control>
              <Form.Description>{t('verifyTokenHint')}</Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Item className="col-span-2">
          <Form.Label>{t('webhookUrl')}</Form.Label>
          <CopyField value={config.webhookUrl} />
        </Form.Item>
        <div className="col-span-2 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading && <Spinner size="sm" />}
            {t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const WhatsappConfigContent = () => {
  const { t } = useWhatsappTranslation();
  const { data, loading, error, refetch } = useQuery(WHATSAPP_CONFIG);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-start gap-2 text-sm">
        <p role="alert" className="text-destructive">
          {t('loadFailed')} {error?.message}
        </p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p>{t('configIntro')}</p>
      <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
        <li>{t('configStep1')}</li>
        <li>{t('configStep2')}</li>
        <li>{t('configStep3')}</li>
        <li>{t('configStep4')}</li>
      </ol>
      <WhatsappConfigForm config={data.whatsappConfig} />
    </div>
  );
};

/** Meta app settings that every Embedded Signup connection in the workspace uses. */
export const WhatsappConfigCollapse = () => {
  const { t } = useWhatsappTranslation();
  const integration = INTEGRATIONS[IntegrationType.WHATSAPP_MESSENGER];

  return (
    <Collapsible className="w-full rounded-lg bg-muted">
      <Collapsible.Trigger asChild>
        <Button
          variant="secondary"
          className="group flex h-auto w-full justify-start gap-3 bg-transparent px-3 font-semibold hover:bg-transparent"
        >
          <Collapsible.TriggerIcon className="text-accent-foreground" />
          <IntegrationLogo
            img={getPluginAssetsUrl('frontline', integration.img)}
            name={integration.name}
          />
          {t('title')}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="rounded-lg bg-background p-3 shadow-xs">
        <WhatsappConfigContent />
      </Collapsible.Content>
    </Collapsible>
  );
};
