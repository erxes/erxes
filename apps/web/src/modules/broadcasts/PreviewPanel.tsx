import type { Broadcast } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconSend } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { Button, Input, Label, Spinner, useToast } from 'erxes-ui';
import { type SubmitEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useSession } from '~/modules/auth/session';
import { splitAddresses } from './BroadcastBits';
import { useBroadcastHandlers } from './broadcastQueries';

/**
 * An inbox's look, the same in the app's light and dark themes: the shadow root would
 * otherwise inherit the page's text colour and colour scheme.
 */
const INBOX_STYLE = `:host { all: initial; display: block; color-scheme: light; color: #111;
  background: #f6f7f9; padding: 24px; font-family: -apple-system, Segoe UI, Roboto, sans-serif; }
a { color: #1d4ed8; }`;

/**
 * The email's HTML in a shadow root, so its inline styles and the app's stay apart. Core renders
 * it from Markdown with raw HTML escaped and only web, mail and phone links; DOMPurify strips
 * anything that could run all the same, since the copy shows in the app's own page.
 */
const EmailHtml = ({ html, label }: { html: string; label: string }) => (
  <div
    role="document"
    aria-label={label}
    className="h-130 overflow-auto bg-white"
    ref={(host) => {
      if (!host) return;

      const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
      const style = document.createElement('style');

      style.textContent = INBOX_STYLE;
      root.replaceChildren(style, DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true }));
    }}
  />
);

/** Sends the saved copy, with sample values, to up to 5 addresses. */
const TestSend = ({
  broadcast,
  beforeSend,
}: {
  broadcast: Broadcast;
  beforeSend?: () => Promise<void>;
}) => {
  const { t } = useTranslation('broadcasts');
  const { toast } = useToast();
  const { onError } = useBroadcastHandlers();
  const { user } = useSession();
  const id = useId();
  const [to, setTo] = useState(broadcast.channel === 'email' ? (user.email ?? '') : '');

  const test = useMutation(
    orpc.broadcasts.test.mutationOptions({
      onSuccess: ({ queued }) =>
        toast({ title: t('test-sent', 'Test sent to {{count}} addresses', { count: queued }) }),
      onError,
    }),
  );

  const addresses = splitAddresses(to);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    await beforeSend?.();
    test.mutate({ id: broadcast.id, to: addresses });
  };

  return (
    <form onSubmit={(event) => void submit(event).catch(onError)} className="space-y-1.5">
      <Label htmlFor={id}>{t('test', 'Send a test')}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder={
            broadcast.channel === 'email'
              ? t('test-emails', 'Emails, up to 5')
              : t('test-phones', 'Phone numbers, up to 5')
          }
        />
        <Button
          type="submit"
          variant="outline"
          disabled={!addresses.length || addresses.length > 5 || test.isPending}
        >
          {test.isPending ? <Spinner size="sm" /> : <IconSend />}
          {t('test-send', 'Send')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('test-hint', 'Sample values fill the fields. Tests are not counted.')}
      </p>
    </form>
  );
};

/** The saved copy as a customer gets it: the audience's first, or sample values. */
export const PreviewPanel = ({
  broadcast,
  beforeTest,
  canTest,
  stale,
}: {
  broadcast: Broadcast;
  /** Saves unsaved changes, so the test shows them. */
  beforeTest?: () => Promise<void>;
  canTest: boolean;
  /** The editor has changes the preview doesn't show yet. */
  stale?: boolean;
}) => {
  const { t } = useTranslation('broadcasts');

  // Saving invalidates every broadcasts query, so a saved change loads a new preview.
  const preview = useQuery(orpc.broadcasts.preview.queryOptions({ input: { id: broadcast.id } }));

  return (
    <aside className="flex min-h-0 flex-col gap-4">
      {stale && (
        <p className="text-xs text-muted-foreground">
          {t('preview-stale', 'The preview shows the saved copy. Save to see your changes.')}
        </p>
      )}
      <QueryState query={preview}>
        {(rendered) => (
          <div className="overflow-hidden rounded-lg border bg-background">
            <dl className="space-y-1 border-b bg-muted/40 px-4 py-3 text-sm">
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-muted-foreground">{t('to', 'To')}</dt>
                <dd className="truncate">{rendered.to ?? t('sample', 'Sample customer')}</dd>
              </div>
              {rendered.subject !== null && (
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-muted-foreground">{t('subject', 'Subject')}</dt>
                  <dd className="truncate font-medium">{rendered.subject}</dd>
                </div>
              )}
            </dl>
            {rendered.html === null ? (
              <p className="m-4 whitespace-pre-wrap rounded-2xl bg-muted p-3 text-sm">
                {rendered.text}
              </p>
            ) : (
              <EmailHtml html={rendered.html} label={t('preview', 'Preview')} />
            )}
          </div>
        )}
      </QueryState>
      {canTest && <TestSend broadcast={broadcast} beforeSend={beforeTest} />}
    </aside>
  );
};
