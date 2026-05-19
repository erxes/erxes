import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { useState } from 'react';
import { Link } from 'react-router';
import { useRemoveAutomationEmailTemplate } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplateMutations';
import { useAutomationEmailTemplates } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplates';
import { EmailTemplatesList } from '@/automations/components/settings/components/email-templates/components/EmailTemplatesList';
import { AutomationSettingsPageShell } from '@/automations/components/settings/components/AutomationSettingsPageShell';

export function AutomationEmailTemplatesSettings() {
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);

  const { emailTemplates, totalCount, loading, refetch } =
    useAutomationEmailTemplates({
      page,
      searchValue,
    });

  const { removeEmailTemplate, loading: removing } =
    useRemoveAutomationEmailTemplate();

  const handleRemove = async (id: string) => {
    if (confirm('Are you sure you want to remove this email template?')) {
      await removeEmailTemplate(id);
      refetch();
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  return (
    <AutomationSettingsPageShell
      title="Email Templates"
      description="Create and manage email templates for your automation workflows"
      actions={
        <Button asChild>
          <Link to="/settings/automations/email-templates/create">
            <IconPlus />
            Create Template
          </Link>
        </Button>
      }
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search email templates..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {loading
            ? 'Loading...'
            : `${totalCount} template${totalCount !== 1 ? 's' : ''}`}
        </span>
      </div>

      <EmailTemplatesList
        templates={emailTemplates}
        loading={loading}
        onRemove={handleRemove}
      />
    </AutomationSettingsPageShell>
  );
}
