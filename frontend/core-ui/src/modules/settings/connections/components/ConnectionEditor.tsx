import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconExternalLink,
  IconLock,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, useReducedMotion } from 'motion/react';
import {
  Button,
  Collapsible,
  Form,
  Input,
  Sheet,
  Stepper,
  useToast,
} from 'erxes-ui';
import {
  credentialFormSchema,
  credentialInput,
  type CredentialFormValues,
} from '../form';
import { connectionDefaults, connectionReviewFields } from '../connectionForm';
import { CREDENTIALS_CREATE, CREDENTIALS_UPDATE } from '../graphql';
import { CONNECTION_PROVIDERS, categoryName, providerName } from '../providers';
import type { CredentialMetadata, CredentialTemplate } from '../types';
import { useCredentialMutationClient } from '../useCredentialMutationClient';
import { ConnectionFields } from './ConnectionFields';
import { ProviderCatalog } from './ProviderCatalog';
import { ProviderLogo } from './ProviderLogo';

export function ConnectionEditor({
  connection,
  initialProvider,
  templates,
  onClose,
  onSaved,
  onView,
}: {
  connection?: CredentialMetadata;
  initialProvider?: CredentialTemplate;
  templates: CredentialTemplate[];
  onClose: () => void;
  onSaved: () => void;
  onView: (id: string) => void;
}) {
  const client = useCredentialMutationClient();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const [provider, setProvider] = useState(
    initialProvider ||
      templates.find(({ id }) => id === connection?.templateId),
  );
  const [step, setStep] = useState(connection || initialProvider ? 2 : 1);
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [failure, setFailure] = useState(false);
  const [saved, setSaved] = useState<CredentialMetadata | null>(null);
  const active = useRef(true);
  const submitting = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: connectionDefaults(provider, connection),
  });
  const setup = provider ? CONNECTION_PROVIDERS[provider.id] : undefined;

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    titleRef.current?.focus();
  }, [step, saved]);

  const close = () => {
    active.current = false;
    form.reset(connectionDefaults());
    onClose();
  };
  const choose = (next: CredentialTemplate) => {
    setProvider(next);
    form.reset(connectionDefaults(next));
    setAdvanced(false);
    setFailure(false);
    setStep(2);
  };
  const review = form.handleSubmit(
    () => {
      setFailure(false);
      setStep(3);
    },
    (errors) => {
      if (errors.fields || errors.description) setAdvanced(true);
    },
  );
  const submit = async (values: CredentialFormValues) => {
    if (submitting.current || !provider) return;
    submitting.current = true;
    setSaving(true);
    setFailure(false);
    try {
      const result = await client.mutate<{
        credentialsCreate?: CredentialMetadata;
        credentialsUpdate?: CredentialMetadata;
      }>({
        mutation: connection ? CREDENTIALS_UPDATE : CREDENTIALS_CREATE,
        variables: {
          ...(connection ? { _id: connection._id } : {}),
          input: credentialInput(values),
        },
        fetchPolicy: 'no-cache',
      });
      const metadata = connection
        ? result.data?.credentialsUpdate
        : result.data?.credentialsCreate;
      if (!metadata) throw new Error('Connection metadata unavailable');
      onSaved();
      if (active.current) {
        form.reset(connectionDefaults());
        setSaved(metadata);
        toast({
          title: connection ? 'Connection updated' : 'Connection saved',
          variant: 'success',
        });
      }
    } catch {
      if (active.current) setFailure(true);
    } finally {
      submitting.current = false;
      if (active.current) setSaving(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && close()}>
      <Sheet.View className="p-0 sm:max-w-xl motion-reduce:animate-none">
        <Sheet.Header>
          <Sheet.Title className="text-sm">
            {connection ? 'Edit connection' : 'New connection'}
          </Sheet.Title>
          <Sheet.Close aria-label="Close connection setup" />
        </Sheet.Header>
        {saved ? (
          <>
            <Sheet.Content className="flex flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-12 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-accent">
                <IconCheck className="size-8 text-primary" />
              </span>
              <ProviderLogo provider={saved.templateId} />
              <div className="space-y-2">
                <h2
                  ref={titleRef}
                  tabIndex={-1}
                  className="text-xl font-semibold tracking-tight outline-none"
                >
                  {connection
                    ? 'Connection updated'
                    : 'Your connection is configured'}
                </h2>
                <Sheet.Description className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {saved.name} is saved securely. Grant an app access when
                  you’re ready to use it.
                </Sheet.Description>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Provider access has not been tested. Existing integration
                settings haven’t changed.
              </p>
            </Sheet.Content>
            <Sheet.Footer className="justify-between gap-2">
              <Button variant="ghost" onClick={close}>
                Done
              </Button>
              <Button
                onClick={() => {
                  const id = saved._id;
                  close();
                  onView(id);
                }}
              >
                View connection
                <IconArrowRight />
              </Button>
            </Sheet.Footer>
          </>
        ) : (
          <Form {...form}>
            <form
              className="flex min-h-0 flex-1 flex-col"
              autoComplete="off"
              onSubmit={(event) => {
                event.preventDefault();
                if (step === 2) void review();
                else if (step === 3) void form.handleSubmit(submit)();
              }}
            >
              <Sheet.Content className="overflow-y-auto p-6">
                <Stepper
                  value={step}
                  className="mb-8 gap-3"
                  aria-label="Connection setup progress"
                >
                  {['Provider', 'Configure', 'Review'].map((label, index) => (
                    <Stepper.Item
                      key={label}
                      step={index + 1}
                      className="flex flex-1 items-center gap-2"
                    >
                      <Stepper.Indicator asChild>
                        {step > index + 1 ? (
                          <IconCheck className="size-3.5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </Stepper.Indicator>
                      <span
                        aria-current={step === index + 1 ? 'step' : undefined}
                        className="text-xs font-medium"
                      >
                        {label}
                      </span>
                      {index < 2 && <Stepper.Separator />}
                    </Stepper.Item>
                  ))}
                </Stepper>
                <motion.div
                  key={step}
                  data-connection-step={step}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3">
                    {provider && <ProviderLogo provider={provider.id} />}
                    <div className="min-w-0 space-y-1.5">
                      <h2
                        ref={titleRef}
                        tabIndex={-1}
                        className="text-lg font-semibold tracking-tight outline-none"
                      >
                        {step === 1
                          ? 'What would you like to connect?'
                          : step === 2
                          ? `Set up ${providerName(
                              provider?.id || '',
                              templates,
                            )}`
                          : 'Review your connection'}
                      </h2>
                      <Sheet.Description className="text-sm leading-relaxed text-muted-foreground">
                        {step === 1
                          ? 'Choose a provider. We’ll guide you through the rest.'
                          : step === 2
                          ? 'Add your account details. We’ll keep them encrypted.'
                          : 'Check the details before saving. Your secret values stay private.'}
                      </Sheet.Description>
                    </div>
                  </div>
                  {step === 1 ? (
                    <ProviderCatalog
                      templates={templates}
                      onChoose={choose}
                      compact
                    />
                  ) : step === 2 ? (
                    <fieldset disabled={saving} className="space-y-6">
                      {setup && (
                        <Collapsible className="rounded-lg border bg-muted/30 p-4">
                          <Collapsible.Trigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-auto w-full justify-start p-0 text-sm"
                            >
                              <Collapsible.TriggerIcon />
                              Where do I find these details?
                            </Button>
                          </Collapsible.Trigger>
                          <Collapsible.Content className="space-y-3 pt-3">
                            <ol className="list-decimal space-y-2 pl-5 text-xs leading-relaxed text-muted-foreground">
                              {setup.instructions.map((instruction) => (
                                <li key={instruction}>{instruction}</li>
                              ))}
                            </ol>
                            <Button
                              asChild
                              variant="link"
                              className="h-auto p-0 text-xs"
                            >
                              <a
                                href={setup.docs}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open provider guide
                                <IconExternalLink />
                              </a>
                            </Button>
                          </Collapsible.Content>
                        </Collapsible>
                      )}
                      <Form.Field
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label
                              variant="peer"
                              className="text-sm font-medium"
                            >
                              Connection name
                            </Form.Label>
                            <Form.Control>
                              <Input
                                {...field}
                                placeholder="For example, Production account"
                                maxLength={120}
                              />
                            </Form.Control>
                            <Form.Description className="leading-relaxed text-muted-foreground">
                              A name your team will recognize. Don’t include
                              secrets.
                            </Form.Description>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                      <ConnectionFields
                        descriptors={
                          provider?.fields || connection?.fields || []
                        }
                      />
                      <Collapsible open={advanced} onOpenChange={setAdvanced}>
                        <Collapsible.Trigger asChild>
                          <Button
                            variant="ghost"
                            type="button"
                            className="px-0 text-muted-foreground"
                          >
                            <Collapsible.TriggerIcon />
                            Optional settings
                          </Button>
                        </Collapsible.Trigger>
                        <Collapsible.Content className="space-y-5 pt-4">
                          <ConnectionFields
                            optional
                            descriptors={
                              provider?.fields || connection?.fields || []
                            }
                          />
                          <Form.Field
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <Form.Item>
                                <Form.Label
                                  variant="peer"
                                  className="text-sm font-medium"
                                >
                                  Description (optional)
                                </Form.Label>
                                <Form.Control>
                                  <Input
                                    {...field}
                                    placeholder="What will your team use this connection for?"
                                    maxLength={1000}
                                  />
                                </Form.Control>
                                <Form.Description className="leading-relaxed text-muted-foreground">
                                  Visible to your team. Don’t include private
                                  account details.
                                </Form.Description>
                                <Form.Message />
                              </Form.Item>
                            )}
                          />
                        </Collapsible.Content>
                      </Collapsible>
                    </fieldset>
                  ) : (
                    <div className="space-y-5">
                      <dl className="space-y-4 rounded-lg bg-muted/40 p-4 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Connection name
                          </dt>
                          <dd className="mt-1 break-words font-medium">
                            {form.getValues('name')}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Provider
                          </dt>
                          <dd className="mt-1">
                            {provider?.name} ·{' '}
                            {categoryName(provider?.category || '')}
                          </dd>
                        </div>
                      </dl>
                      <dl className="divide-y text-sm">
                        {connectionReviewFields(form.getValues()).map(
                          (field) => (
                            <div
                              key={field.key}
                              className="flex justify-between gap-4 py-3"
                            >
                              <dt>{field.label}</dt>
                              <dd className="shrink-0 text-xs text-muted-foreground">
                                {field.status}
                              </dd>
                            </div>
                          ),
                        )}
                      </dl>
                      <div className="flex gap-2 rounded-lg border p-4 text-xs leading-relaxed text-muted-foreground">
                        <IconLock className="mt-0.5 size-4 shrink-0" />
                        <p>
                          Details are encrypted and only shared with apps you
                          authorize. Saving doesn’t test provider access or
                          replace existing integration settings.
                        </p>
                      </div>
                    </div>
                  )}
                  {failure && (
                    <div
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                    >
                      We couldn’t save this connection. Check your permissions
                      and try again. Your details are still here.
                    </div>
                  )}
                </motion.div>
              </Sheet.Content>
              <Sheet.Footer className="justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={saving}
                  onClick={() =>
                    step === 3
                      ? setStep(2)
                      : step === 2 && !connection
                      ? setStep(1)
                      : close()
                  }
                >
                  <IconArrowLeft />
                  {step === 1 || (step === 2 && connection) ? 'Cancel' : 'Back'}
                </Button>
                {step > 1 && (
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? 'Saving…'
                      : step === 2
                      ? 'Review connection'
                      : connection
                      ? 'Save changes'
                      : 'Save connection'}
                    {!saving && <IconArrowRight />}
                  </Button>
                )}
              </Sheet.Footer>
            </form>
          </Form>
        )}
      </Sheet.View>
    </Sheet>
  );
}
