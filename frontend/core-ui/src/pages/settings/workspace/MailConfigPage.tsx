import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';
import { MailConfigSenders } from '@/settings/mail-config/components/MailConfigSenders';
import { MailConfigSending } from '@/settings/mail-config/components/MailConfigSending';
import { MailConfigTemplate } from '@/settings/mail-config/components/MailConfigTemplate';
import { useMailConfigView } from '@/settings/mail-config/hooks/useMailConfigView';
import { PageContainer, ScrollArea } from 'erxes-ui';

export function MailConfigPage() {
  const { view } = useMailConfigView();

  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea className="h-full">
        <section className="mx-auto max-w-2xl w-full px-4 pb-10">
          {view === 'sending' && <MailConfigSending />}
          {view === 'senders' && <MailConfigSenders />}
          {view === 'template' && <MailConfigTemplate />}
        </section>
      </ScrollArea>
    </PageContainer>
  );
}
