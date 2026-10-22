import { useApolloClient, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBrandWhatsapp, IconPhone } from '@tabler/icons-react';
import { Badge, Button, Form, Input, Sheet, Spinner, toast } from 'erxes-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { SelectBrand, currentOrganizationState } from 'ui-modules';
import { z } from 'zod';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { IntegrationType } from '@/types/Integration';
import {
  WHATSAPP_DISCARD_CONNECTION,
  WHATSAPP_EMBEDDED_SIGNUP_CONFIG,
  WhatsappConnection,
  WhatsappEmbeddedSignupConfig,
} from './graphql';
import { WhatsappTranslationKey, useWhatsappTranslation } from './translations';
import {
  WhatsappSignupPhase,
  useWhatsappEmbeddedSignup,
} from './useWhatsappEmbeddedSignup';

const STEPS = 2;
const CONNECT_LABELS: Record<WhatsappSignupPhase, WhatsappTranslationKey> = {
  idle: 'continueWithMeta',
  waiting: 'openingMeta',
  verifying: 'verifying',
};
const SETUP_FORM_ID = 'whatsapp-setup-form';

/** A number not yet on the Cloud API registers only with the customer's own PIN. */
const getSetupSchema = (
  t: (key: WhatsappTranslationKey) => string,
  needsRegistration: boolean,
) =>
  z.object({
    name: z.string().trim().min(1, t('nameRequired')),
    brandId: z.string().min(1, t('brandRequired')),
    pin: z
      .string()
      .trim()
      .refine((value) => !needsRegistration || value !== '', {
        message: t('pinRequired'),
      })
      .refine((value) => value === '' || /^\d{6}$/.test(value), {
        message: t('pinInvalid'),
      }),
  });

type SetupValues = z.infer<ReturnType<typeof getSetupSchema>>;

/** Step 1: Meta's Embedded Signup popup selects the business, WABA and number. */
const WhatsappConnectStep = ({
  config,
  onConnected,
}: {
  config: WhatsappEmbeddedSignupConfig;
  onConnected: (connection: WhatsappConnection) => void;
}) => {
  const { t } = useWhatsappTranslation();
  const isSaas = useAtomValue(currentOrganizationState)?.type === 'saas';
  const { launch, phase, sdkStatus } = useWhatsappEmbeddedSignup({
    config,
    onConnected,
  });

  if (!config.isConfigured) {
    // SaaS manages the Meta app centrally and hides its settings form.
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border p-4 text-sm">
        <p className="font-medium">{t('notConfigured')}</p>
        <p className="text-muted-foreground">
          {t(isSaas ? 'notConfiguredSaas' : 'notConfiguredDescription')}
        </p>
        {!isSaas && (
          <Button asChild variant="outline">
            <Link
              to={`/${FrontlinePaths.Frontline}/settings${FrontlinePaths.IntegrationConfig}`}
            >
              {t('openConfig')}
            </Link>
          </Button>
        )}
      </div>
    );
  }

  const busy = phase !== 'idle';

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        type="button"
        onClick={launch}
        disabled={busy || sdkStatus !== 'ready'}
      >
        {busy || sdkStatus === 'loading' ? (
          <Spinner size="sm" />
        ) : (
          <IconBrandWhatsapp />
        )}
        {t(CONNECT_LABELS[phase])}
      </Button>
      {sdkStatus === 'error' ? (
        <p role="alert" className="text-sm text-destructive">
          {t('sdkLoadFailed')}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{t('popupHint')}</p>
      )}
    </div>
  );
};

const ConnectedNumber = ({
  connection,
  onChange,
}: {
  connection: WhatsappConnection;
  onChange?: () => void;
}) => {
  const { t } = useWhatsappTranslation();

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <IconPhone className="mt-0.5 size-4 text-muted-foreground" />
      <div className="flex flex-1 flex-col gap-1 text-sm">
        <span className="text-xs text-muted-foreground">
          {t('connectedNumber')}
        </span>
        <span className="font-medium">{connection.displayPhoneNumber}</span>
        {connection.verifiedName && (
          <span className="text-muted-foreground">
            {connection.verifiedName}
          </span>
        )}
        <Badge
          variant={connection.needsRegistration ? 'secondary' : 'success'}
          className="w-fit"
        >
          {connection.needsRegistration
            ? t('statusPending')
            : t('statusConnected')}
        </Badge>
      </div>
      {onChange && (
        <Button type="button" variant="ghost" size="sm" onClick={onChange}>
          {t('changeNumber')}
        </Button>
      )}
    </div>
  );
};

/** Step 2: names the inbox, picks its brand and attaches the verified number. */
const WhatsappSetupStep = ({
  connection,
  onChangeNumber,
  onSubmit,
}: {
  connection: WhatsappConnection;
  onChangeNumber: () => void;
  onSubmit: (values: SetupValues) => void;
}) => {
  const { t } = useWhatsappTranslation();
  const form = useForm<SetupValues>({
    resolver: zodResolver(getSetupSchema(t, connection.needsRegistration)),
    defaultValues: {
      name: connection.verifiedName || connection.displayPhoneNumber,
      brandId: '',
      pin: '',
    },
  });

  return (
    <Form {...form}>
      <form
        id={SETUP_FORM_ID}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <ConnectedNumber connection={connection} onChange={onChangeNumber} />
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('name')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('brand')}</Form.Label>
              <Form.Control>
                <SelectBrand
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('chooseBrand')}
                  className="w-full"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        {connection.needsRegistration && (
          <Form.Field
            control={form.control}
            name="pin"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('pin')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                  />
                </Form.Control>
                <Form.Description>{t('pinHint')}</Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <p>{t('windowHint')}</p>
          <p>{t('paymentHint')}</p>
        </div>
      </form>
    </Form>
  );
};

const WhatsappSetup = ({ onClose }: { onClose: () => void }) => {
  const { t } = useWhatsappTranslation();
  const [connection, setConnection] = useState<WhatsappConnection>();
  const { data, loading, error, refetch } = useQuery(
    WHATSAPP_EMBEDDED_SIGNUP_CONFIG,
    { fetchPolicy: 'network-only' },
  );
  const { id: channelId } = useParams<{ id: string }>();
  const { addIntegration, loading: creating } = useIntegrationAdd();
  const config = data?.whatsappEmbeddedSignupConfig;
  const client = useApolloClient();
  // The signup connection not yet attached to an inbox; it holds a token.
  const pendingIdRef = useRef<string>();

  const discardPending = useCallback(() => {
    const _id = pendingIdRef.current;
    pendingIdRef.current = undefined;

    if (!_id) return;

    // Silent cleanup: the server also expires unattached connections after a day.
    client
      .mutate({ mutation: WHATSAPP_DISCARD_CONNECTION, variables: { _id } })
      .catch(() => undefined);
  }, [client]);

  // Closing the sheet before finishing drops the unused connection.
  useEffect(() => discardPending, [discardPending]);

  const handleConnected = (next: WhatsappConnection) => {
    pendingIdRef.current = next._id;
    setConnection(next);
  };

  const changeNumber = () => {
    discardPending();
    setConnection(undefined);
  };

  const createIntegration = (values: SetupValues) => {
    if (!connection) return;

    addIntegration({
      variables: {
        kind: IntegrationType.WHATSAPP_MESSENGER,
        name: values.name.trim(),
        brandId: values.brandId,
        channelId: channelId ?? '',
        data: {
          connectionId: connection._id,
          ...(values.pin ? { pin: values.pin } : {}),
        },
      },
      onCompleted: () => {
        pendingIdRef.current = undefined;
        toast({ title: t('created'), variant: 'success' });
        onClose();
      },
    });
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size="sm" />
          {t('loadingSetup')}
        </div>
      );
    }

    if (error || !config) {
      return (
        <div className="flex flex-col items-start gap-2 text-sm">
          <p role="alert" className="text-destructive">
            {t('setupLoadFailed')} {error?.message}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
          >
            {t('retry')}
          </Button>
        </div>
      );
    }

    if (connection) {
      return (
        <WhatsappSetupStep
          connection={connection}
          onChangeNumber={changeNumber}
          onSubmit={createIntegration}
        />
      );
    }

    return (
      <WhatsappConnectStep config={config} onConnected={handleConnected} />
    );
  };

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>{t('connect')}</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex flex-col overflow-auto styled-scroll">
        <IntegrationSteps
          step={connection ? 2 : 1}
          stepsLength={STEPS}
          title={connection ? t('stepSetup') : t('stepConnect')}
          description={
            connection ? t('stepSetupDescription') : t('stepConnectDescription')
          }
        />
        <div className="p-4 pt-0">{renderBody()}</div>
      </Sheet.Content>
      <Sheet.Footer>
        <Sheet.Close asChild>
          <Button type="button" variant="ghost" className="mr-auto">
            {t('cancel')}
          </Button>
        </Sheet.Close>
        {connection && (
          <Button type="submit" form={SETUP_FORM_ID} disabled={creating}>
            {creating && <Spinner size="sm" />}
            {t('finish')}
          </Button>
        )}
      </Sheet.Footer>
    </>
  );
};

/** Add-integration entry: a sheet that runs Embedded Signup, then inbox setup. */
export const WhatsappIntegrationDetail = () => {
  const { t } = useWhatsappTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconBrandWhatsapp />
          {t('connect')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-xl">
        {open && <WhatsappSetup onClose={() => setOpen(false)} />}
      </Sheet.View>
    </Sheet>
  );
};
