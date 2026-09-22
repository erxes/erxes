import { EmailTemplatesGrid } from '@/emailTemplates/components/EmailTemplatesGrid';
import { EmailTemplatesTable } from '@/emailTemplates/components/EmailTemplatesTable';
import { EmailTemplatesViewToggle } from '@/emailTemplates/components/EmailTemplatesViewToggle';
import { useEmailTemplateMutations } from '@/emailTemplates/hooks/useEmailTemplateMutations';
import { useEmailTemplates } from '@/emailTemplates/hooks/useEmailTemplates';
import { emailTemplatesViewAtom } from '@/emailTemplates/states/emailTemplatesViewState';
import { IconMail, IconSearch } from '@tabler/icons-react';
import { Input, PageSubHeader, Separator } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';

const EmptyState = ({ hasSearch }: { hasSearch: boolean }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
    <IconMail className="size-8 text-muted-foreground" />
    <p className="text-sm text-muted-foreground">
      {hasSearch
        ? 'No template matches that search.'
        : 'No email templates yet.'}
    </p>
  </div>
);

export const EmailTemplatesSettings = () => {
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const view = useAtomValue(emailTemplatesViewAtom);

  const { emailTemplates, totalCount, loading, refetch } = useEmailTemplates({
    page,
    searchValue,
  });

  const { removeEmailTemplate } = useEmailTemplateMutations();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handleRemove = async (id: string) => {
    if (confirm('Are you sure you want to remove this email template?')) {
      await removeEmailTemplate({ variables: { _id: id } });
      refetch();
    }
  };

  const isEmpty = !loading && emailTemplates.length === 0;

  return (
    <>
      <PageSubHeader className="items-center">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search email templates..."
            value={searchValue}
            onChange={(event) => handleSearch(event.target.value)}
            className="h-8 pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {loading
            ? 'Loading...'
            : `${totalCount} template${totalCount !== 1 ? 's' : ''}`}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Separator.Inline />
          <EmailTemplatesViewToggle />
        </div>
      </PageSubHeader>

      {isEmpty ? (
        <EmptyState hasSearch={!!searchValue} />
      ) : view === 'grid' ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <EmailTemplatesGrid
            templates={emailTemplates}
            loading={loading}
            onRemove={handleRemove}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <EmailTemplatesTable
            templates={emailTemplates}
            loading={loading}
            onRemove={handleRemove}
          />
        </div>
      )}
    </>
  );
};
