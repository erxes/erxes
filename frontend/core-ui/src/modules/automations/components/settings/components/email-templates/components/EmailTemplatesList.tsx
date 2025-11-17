import { EmailTemplateCard } from '@/automations/components/settings/components/email-templates/components/EmailTemplateCard';
import { IAutomationEmailTemplate } from '@/automations/components/settings/components/email-templates/types/automationEmailTemplates';
import { IconMail } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';

interface EmailTemplatesListProps {
  templates: IAutomationEmailTemplate[];
  loading: boolean;
  onRemove: (id: string) => void;
}

export function EmailTemplatesList({
  templates,
  loading,
  onRemove,
}: EmailTemplatesListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <IconMail className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No email templates</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Create your first email template to get started with automated email
          campaigns.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <EmailTemplateCard
          key={template._id}
          template={template}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
