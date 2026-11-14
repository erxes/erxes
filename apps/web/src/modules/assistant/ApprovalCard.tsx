import { IconShieldCheck } from '@tabler/icons-react';
import { Button, Collapsible } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ApprovalCard = ({
  procedure,
  input,
  disabled,
  onRespond,
}: {
  procedure: string;
  input: Record<string, unknown>;
  disabled: boolean;
  onRespond: (approved: boolean) => void;
}) => {
  const { t } = useTranslation('assistant');

  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
      <legend className="sr-only">{t('approval.title', 'Approve this change?')}</legend>
      <div className="flex items-start gap-2">
        <IconShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary-text" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p aria-hidden className="text-sm font-semibold">
            {t('approval.title', 'Approve this change?')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('approval.description', 'The assistant wants to run')}{' '}
            <code className="rounded bg-muted px-1 font-mono text-foreground">{procedure}</code>
          </p>
        </div>
      </div>
      <Collapsible>
        <Collapsible.Trigger render={<Button variant="ghost" size="sm" tone="muted" />}>
          <Collapsible.TriggerIcon className="size-3" />
          {t('approval.details', 'What it will send')}
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <pre className="mt-1 max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs whitespace-pre-wrap">
            {JSON.stringify(input, null, 2)}
          </pre>
        </Collapsible.Panel>
      </Collapsible>
      <div className="flex gap-2">
        <Button disabled={disabled} onClick={() => onRespond(true)}>
          {t('approval.approve', 'Approve')}
        </Button>
        <Button variant="outline" disabled={disabled} onClick={() => onRespond(false)}>
          {t('approval.decline', 'Decline')}
        </Button>
      </div>
    </fieldset>
  );
};
