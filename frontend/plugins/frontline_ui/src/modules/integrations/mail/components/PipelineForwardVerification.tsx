import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconMailForward,
} from '@tabler/icons-react';
import { Alert, Button, Spinner, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  IMailPipelineIntegration,
  useMailPipelineForwardVerified,
} from '../hooks/useMailPipelineIntegration';

const VerificationCode = ({ code }: { code: string }) => {
  const { t } = useTranslation('frontline');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: t('copied') });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="rounded bg-muted px-2 py-1 font-mono text-sm tracking-wide">
        {code}
      </code>
      <Button size="icon" variant="ghost" onClick={copy} type="button">
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </Button>
    </div>
  );
};

const AwaitingNotice = ({ forwardFrom }: { forwardFrom: string }) => {
  const { t } = useTranslation('frontline');

  return (
    <Alert>
      <IconMailForward className="h-4 w-4" />
      <Alert.Title className="font-medium">
        {t(
          'pipeline-mail-forward-awaiting',
          'Waiting for the forwarding confirmation',
        )}
      </Alert.Title>
      <Alert.Description className="mt-1 space-y-2 text-sm text-muted-foreground">
        <span className="block">
          {t(
            'pipeline-mail-forward-awaiting-description',
            'Set up forwarding from {{address}} to the address above. The confirmation your mail provider sends is held here instead of opening a ticket, and its code appears on this page.',
            { address: forwardFrom },
          )}
        </span>
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          {t('pipeline-mail-forward-awaiting-hint', 'Checking for it now')}
        </span>
      </Alert.Description>
    </Alert>
  );
};

export const PipelineForwardVerification = ({
  pipelineId,
  integration,
  waiting,
}: {
  pipelineId: string;
  integration: IMailPipelineIntegration;
  waiting: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const { markForwardVerified, loading } = useMailPipelineForwardVerified();

  const verification = integration.forwardVerification;

  if (!verification) {
    return waiting ? (
      <AwaitingNotice forwardFrom={integration.forwardFrom ?? ''} />
    ) : null;
  }

  return (
    <Alert>
      <IconMailForward className="h-4 w-4" />
      <Alert.Title className="font-medium">
        {t(
          'pipeline-mail-forward-received',
          'Your mail provider asked for a confirmation',
        )}
      </Alert.Title>
      <Alert.Description className="mt-2 space-y-3 text-sm">
        {verification.subject && (
          <p className="text-muted-foreground">{verification.subject}</p>
        )}

        {verification.code ? (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t('pipeline-mail-forward-code', 'Confirmation code')}
            </p>
            <VerificationCode code={verification.code} />
          </div>
        ) : null}

        {verification.link ? (
          <Button asChild variant="secondary" size="sm">
            <a
              href={verification.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconExternalLink size={14} />
              {t('pipeline-mail-forward-open-link', 'Open the confirmation')}
            </a>
          </Button>
        ) : null}

        {!verification.code && !verification.link && verification.excerpt ? (
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs">
            {verification.excerpt}
          </pre>
        ) : null}

        <div className="flex items-center gap-2 border-t pt-3">
          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={() => markForwardVerified(pipelineId)}
          >
            {loading ? <Spinner /> : <IconCheck size={14} />}
            {t('pipeline-mail-forward-done', 'I confirmed it')}
          </Button>
          <span className="text-xs text-muted-foreground">
            {t(
              'pipeline-mail-forward-done-hint',
              'Ordinary mail already opens tickets. Only a confirmation like this one is held here, and only until you confirm.',
            )}
          </span>
        </div>
      </Alert.Description>
    </Alert>
  );
};
