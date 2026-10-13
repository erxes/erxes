import { gql, useApolloClient, useQuery } from '@apollo/client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDebounce } from 'use-debounce';
import {
  Button,
  Command,
  Popover,
  Skeleton,
  Spinner,
  renderEmailHtml,
  toast,
} from 'erxes-ui';
import type { JSONContent } from 'erxes-ui';

const MAIL_EMAIL_TEMPLATES = gql`
  query frontlineMailEmailTemplates($searchValue: String, $cursor: String) {
    emailTemplates(searchValue: $searchValue, cursor: $cursor, limit: 30) {
      list {
        _id
        name
        description
        content
        contentJson
        contentFormat
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const MAIL_EMAIL_TEMPLATE_CONTENT = gql`
  query frontlineMailEmailTemplateContent(
    $content: String
    $contentFormat: String
  ) {
    emailContentPreview(content: $content, contentFormat: $contentFormat)
  }
`;

interface EmailTemplate {
  _id: string;
  name: string;
  description?: string;
  content?: string;
  contentJson?: JSONContent;
  contentFormat?: 'blocks' | 'maily';
}
interface TemplatesResult {
  emailTemplates: {
    list: EmailTemplate[];
    pageInfo: { endCursor?: string; hasNextPage: boolean };
  };
}

export const DirectMailTemplateSelector = ({
  children,
  disabled,
  onSelect,
}: {
  children: ReactNode;
  disabled: boolean;
  onSelect: (html: string) => Promise<void>;
}) => {
  const client = useApolloClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search, 250);
  const [applyingId, setApplyingId] = useState<string>();
  const applying = Boolean(applyingId);
  const { data, loading, error, refetch, fetchMore } =
    useQuery<TemplatesResult>(MAIL_EMAIL_TEMPLATES, {
      variables: { searchValue: searchValue || undefined },
      skip: !open,
      notifyOnNetworkStatusChange: true,
    });
  const select = async (template: EmailTemplate) => {
    if (disabled || applying) return;
    setApplyingId(template._id);
    try {
      const contentFormat =
        template.contentFormat || (template.contentJson ? 'maily' : 'blocks');
      const content =
        contentFormat === 'maily'
          ? await renderEmailHtml(template.contentJson)
          : template.content;
      if (!content) throw new Error('This email template has no content');
      const result = await client.query<{ emailContentPreview: string }>({
        query: MAIL_EMAIL_TEMPLATE_CONTENT,
        variables: { content, contentFormat },
        fetchPolicy: 'network-only',
      });
      await onSelect(result.data.emailContentPreview);
      setOpen(false);
    } catch (cause) {
      toast({
        title: 'Unable to insert email template',
        description: cause instanceof Error ? cause.message : 'Try again',
        variant: 'destructive',
      });
    } finally {
      setApplyingId(undefined);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled || applying}>
        {children}
      </Popover.Trigger>
      <Popover.Content className="w-80 p-0" side="top" align="start">
        <Command shouldFilter={false}>
          <Command.Input
            placeholder="Search email templates"
            value={search}
            onValueChange={setSearch}
          />
          <Command.List className="max-h-72 overflow-y-auto">
            {loading && !data?.emailTemplates.list.length && (
              <div
                role="status"
                aria-label="Loading email templates"
                className="space-y-2 p-2"
              >
                {[0, 1, 2].map((row) => (
                  <Skeleton key={row} className="h-8 w-full" />
                ))}
              </div>
            )}
            {error && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void refetch()}
              >
                Could not load email templates. Retry
              </Button>
            )}
            {!loading && !error && !data?.emailTemplates.list.length && (
              <Command.Empty>No email templates found.</Command.Empty>
            )}
            {data?.emailTemplates.list.map((template) => (
              <Command.Item
                key={template._id}
                value={template._id}
                disabled={disabled || applying}
                onSelect={() => void select(template)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">{template.name}</p>
                  {template.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                </div>
                {applyingId === template._id && (
                  <span
                    role="status"
                    aria-label="Inserting template"
                    className="ml-auto flex shrink-0"
                  >
                    <Spinner size="sm" />
                  </span>
                )}
              </Command.Item>
            ))}
            {data?.emailTemplates.pageInfo.hasNextPage && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={loading || applying}
                onClick={() => {
                  void fetchMore({
                    variables: {
                      cursor: data.emailTemplates.pageInfo.endCursor,
                    },
                    updateQuery: (previous, { fetchMoreResult }) => {
                      if (!fetchMoreResult) return previous;
                      const ids = new Set(
                        previous.emailTemplates.list.map(
                          (template) => template._id,
                        ),
                      );
                      return {
                        emailTemplates: {
                          ...fetchMoreResult.emailTemplates,
                          list: [
                            ...previous.emailTemplates.list,
                            ...fetchMoreResult.emailTemplates.list.filter(
                              (template) => !ids.has(template._id),
                            ),
                          ],
                        },
                      };
                    },
                  }).catch(() =>
                    toast({
                      title: 'Unable to load more email templates',
                      variant: 'destructive',
                    }),
                  );
                }}
              >
                {loading ? <Spinner size="sm" /> : 'Load more'}
              </Button>
            )}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
