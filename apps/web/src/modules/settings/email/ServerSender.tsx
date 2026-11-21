import type { EmailSender } from '@erxes/core-contract';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { FormSection } from '../integrations/FormSection';

/**
 * SaaS: every email goes out from erxes' address under the organisation's
 * name. Nothing to set up; the name follows Settings › General.
 */
export const ServerSender = ({ sender }: { sender: EmailSender }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });

  return (
    <FormSection
      title={t('section.sender', 'Sender')}
      description={t('section.sender-description', 'Who your emails come from.')}
    >
      <dl className="grid grid-cols-3 gap-x-6 gap-y-1.5 rounded-lg border p-4 text-sm">
        <dt className="text-muted-foreground">{t('field.fromName', 'From name')}</dt>
        <dd className="col-span-2 truncate">{sender.name}</dd>
        <dt className="text-muted-foreground">{t('field.fromEmail', 'From address')}</dt>
        <dd className="col-span-2 truncate">{sender.address}</dd>
      </dl>
      <p className="flex gap-2 text-xs text-muted-foreground">
        <IconInfoCircle className="size-4 shrink-0" />
        {t(
          'server-sender-hint',
          'Emails go out from erxes’ address under your organisation’s name. A broadcast or automation adds a label after it, such as “{{name}} · Marketing”; replies go to your Reply-To address.',
          { name: sender.name },
        )}
      </p>
    </FormSection>
  );
};
