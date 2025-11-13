import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { useState } from 'react';
import { Link } from 'react-router';
import { useRemoveAutomationEmailTemplate } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplateMutations';
import { useAutomationEmailTemplates } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplates';
import { EmailTemplatesList } from '@/automations/components/settings/components/email-templates/components/EmailTemplatesList';

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
    <div className="h-full w-full mx-auto max-w-6xl px-8 py-5 flex flex-col gap-6">
      <div className="flex flex-col gap-2 px-1">
        <h1 className="text-lg font-semibold">Email Templates</h1>
        <span className="font-normal text-muted-foreground text-sm">
          Create and manage email templates for your automation workflows
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search email templates..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link to="/settings/automations/email-templates/create">
            <IconPlus />
            Create Template
          </Link>
        </Button>
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
    </div>
  );
}
