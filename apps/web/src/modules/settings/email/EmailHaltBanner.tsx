import type { EmailLimits } from '@erxes/core-contract';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button, Dialog, Label, Spinner, Textarea, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { type ResumeSending, useEmailLimits, useResumeSending } from './useEmailLimits';

/** Asks why sending may go on: the reason is required and goes into the audit log. */
const ResumeDialog = ({ resume }: { resume: ResumeSending }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });

  return (
    <Dialog open={resume.open} onOpenChange={resume.setOpen}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('resume-title', 'Resume sending?')}</Dialog.Title>
          <Dialog.Description>
            {t(
              'resume-description',
              'Held emails go out, the daily limit goes down a step and the rates count from now. Clean the addresses that bounced first.',
            )}
          </Dialog.Description>
        </Dialog.Header>
        <div className="space-y-1.5">
          <Label htmlFor="email-resume-reason">{t('resume-reason', 'Why it is safe now')}</Label>
          <Textarea
            id="email-resume-reason"
            value={resume.reason}
            maxLength={500}
            onChange={(event) => resume.setReason(event.target.value)}
          />
        </div>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => resume.setOpen(false)}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button variant="destructive" disabled={!resume.canSubmit} onClick={resume.submit}>
            {resume.pending && <Spinner size="sm" />}
            {t('resume', 'Resume sending')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

/** Sending halted by the bounce rate: why, since when, what is held, and Resume. */
export const HaltBanner = ({ limits }: { limits: EmailLimits }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });
  const fmt = useFormat();
  const resume = useResumeSending();

  if (!limits.haltedAt || !limits.active) return null;

  return (
    <section
      role="alert"
      className="flex flex-wrap items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
    >
      <IconAlertTriangle className="mt-0.5 size-4 text-destructive-text" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-sm font-medium text-destructive-text">
          {t('halted-title', 'Sending is halted')}
        </h3>
        {limits.haltReason && <p className="text-sm">{limits.haltReason}</p>}
        <p className="text-xs text-muted-foreground">
          {t(
            'halted-body',
            'Since {{when}}. Only sign-in and account emails go out; {{count}} emails are held until an admin resumes sending.',
            { when: fmt.dateTime(limits.haltedAt), count: limits.held },
          )}
        </p>
      </div>
      <Button variant="destructive" onClick={() => resume.setOpen(true)}>
        {t('resume', 'Resume sending')}
      </Button>
      <ResumeDialog resume={resume} />
    </section>
  );
};

/** The halt banner where the ramp isn't the page's subject (the Overview). */
export const EmailHaltNotice = () => {
  const limits = useEmailLimits();

  return limits.data ? <HaltBanner limits={limits.data} /> : null;
};
