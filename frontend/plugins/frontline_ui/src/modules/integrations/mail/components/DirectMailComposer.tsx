import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { IconMail, IconSend, IconX } from '@tabler/icons-react';
import { Button, Input, Select, Spinner, Textarea } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { MAIL_SENDERS_QUERY } from '@/integrations/mail/graphql/queries/mailSenders';
import { useMailSendMail } from '@/integrations/mail/hooks/useMailConversationDetail';

const COMPOSE_EMAIL_EVENT = 'frontline:compose-email';

interface MailSender {
  integrationId: string;
  name: string;
  address: string;
}

interface ComposeEmailTarget {
  customerId: string;
  email: string;
}

const composeSchema = z.object({
  integrationId: z.string().min(1, 'Choose a sender'),
  to: z.string().email('Enter a valid recipient email'),
  subject: z.string().trim().min(1, 'Subject is required'),
  body: z.string().trim().min(1, 'Message is required'),
});

type ComposeValues = z.infer<typeof composeSchema>;

const toHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('\n', '<br/>');

export const DirectMailComposer = () => {
  const [target, setTarget] = useState<ComposeEmailTarget | null>(null);
  const { data, loading: sendersLoading } = useQuery<{
    mailSenders: MailSender[];
  }>(MAIL_SENDERS_QUERY, { skip: !target });
  const { mailSendMail, loading } = useMailSendMail();
  const senders = useMemo(() => data?.mailSenders ?? [], [data?.mailSenders]);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ComposeValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: { integrationId: '', to: '', subject: '', body: '' },
  });
  const integrationId = watch('integrationId');

  useEffect(() => {
    const handleComposeRequest = (event: Event) => {
      const detail = (event as CustomEvent<ComposeEmailTarget>).detail;
      if (
        !detail?.customerId ||
        !z.string().email().safeParse(detail.email).success
      ) {
        return;
      }

      setTarget(detail);
      reset({ integrationId: '', to: detail.email, subject: '', body: '' });
    };

    window.addEventListener(COMPOSE_EMAIL_EVENT, handleComposeRequest);
    return () =>
      window.removeEventListener(COMPOSE_EMAIL_EVENT, handleComposeRequest);
  }, [reset]);

  useEffect(() => {
    if (target && !integrationId && senders.length) {
      setValue('integrationId', senders[0].integrationId, {
        shouldValidate: true,
      });
    }
  }, [integrationId, senders, setValue, target]);

  if (!target) return null;

  const close = () => {
    setTarget(null);
    reset();
  };

  const submit = (values: ComposeValues) => {
    mailSendMail(
      {
        integrationId: values.integrationId,
        customerId: target.customerId,
        subject: values.subject.trim(),
        body: toHtml(values.body.trim()),
        to: [values.to.trim()],
      },
      close,
    );
  };

  return (
    <section
      aria-label="New email"
      className="fixed right-4 bottom-4 z-50 flex max-h-[calc(100vh-2rem)] w-[min(38rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl"
    >
      <header className="flex h-11 flex-none items-center justify-between border-b bg-primary/5 px-4">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <IconMail className="size-4 text-primary" />
          New email
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Close email composer"
          onClick={close}
          disabled={loading}
        >
          <IconX className="size-4" />
        </Button>
      </header>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={handleSubmit(submit)}
      >
        <div className="grid flex-none grid-cols-[4rem_minmax(0,1fr)] items-center border-b px-4 py-2">
          <label
            className="text-xs text-muted-foreground"
            htmlFor="direct-mail-from"
          >
            From
          </label>
          <Select
            value={integrationId}
            onValueChange={(value) =>
              setValue('integrationId', value, { shouldValidate: true })
            }
          >
            <Select.Trigger
              id="direct-mail-from"
              className="h-8 border-0 px-0 shadow-none"
            >
              <Select.Value
                placeholder={
                  sendersLoading
                    ? 'Loading senders…'
                    : 'Select a verified email'
                }
              />
            </Select.Trigger>
            <Select.Content>
              {senders.map((sender) => (
                <Select.Item
                  key={sender.integrationId}
                  value={sender.integrationId}
                >
                  {sender.name} &lt;{sender.address}&gt;
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          {errors.integrationId && (
            <p className="col-start-2 text-xs text-destructive">
              {errors.integrationId.message}
            </p>
          )}
          {!sendersLoading && !senders.length && (
            <p className="col-start-2 text-xs text-destructive">
              No verified mail sender is available.
            </p>
          )}
        </div>

        <div className="grid flex-none grid-cols-[4rem_minmax(0,1fr)] items-center border-b px-4 py-2">
          <label
            className="text-xs text-muted-foreground"
            htmlFor="direct-mail-to"
          >
            To
          </label>
          <Input
            id="direct-mail-to"
            className="h-8 border-0 px-0 shadow-none"
            {...register('to')}
          />
          {errors.to && (
            <p className="col-start-2 text-xs text-destructive">
              {errors.to.message}
            </p>
          )}
        </div>

        <div className="grid flex-none grid-cols-[4rem_minmax(0,1fr)] items-center border-b px-4 py-2">
          <label
            className="text-xs text-muted-foreground"
            htmlFor="direct-mail-subject"
          >
            Subject
          </label>
          <Input
            id="direct-mail-subject"
            className="h-8 border-0 px-0 shadow-none"
            {...register('subject')}
          />
          {errors.subject && (
            <p className="col-start-2 text-xs text-destructive">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div className="min-h-48 flex-1 p-4">
          <Textarea
            aria-label="Email message"
            className="h-full min-h-44 resize-none border-0 p-0 shadow-none focus-visible:ring-0"
            placeholder="Write your message"
            autoFocus
            {...register('body')}
          />
          {errors.body && (
            <p className="mt-1 text-xs text-destructive">
              {errors.body.message}
            </p>
          )}
        </div>

        <footer className="flex flex-none justify-end border-t px-4 py-3">
          <Button
            type="submit"
            disabled={loading || sendersLoading || !senders.length}
          >
            {loading ? <Spinner size="sm" /> : <IconSend className="size-4" />}
            Send
          </Button>
        </footer>
      </form>
    </section>
  );
};
