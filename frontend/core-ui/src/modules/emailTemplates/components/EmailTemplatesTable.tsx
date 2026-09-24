import { EmailTemplateActions } from '@/emailTemplates/components/EmailTemplateActions';
import { emailTemplateFormat, IEmailTemplate } from '@/emailTemplates/types';
import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import {
  IconCalendarPlus,
  IconFileDescription,
  IconMail,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useNavigate } from 'react-router';
import { MembersInline } from 'ui-modules';
import { useEmailTemplates } from '@/emailTemplates/hooks/useEmailTemplates';
import {
  EmailTemplatesEmptyState,
  EmailTemplatesErrorState,
} from '@/emailTemplates/components/EmailTemplatesStates';

const FORMAT_LABEL = {
  maily: 'Email editor',
  blocks: 'Blocks',
};

const NameCell = ({ template }: { template: IEmailTemplate }) => {
  const navigate = useNavigate();

  return (
    <RecordTableInlineCell
      onClick={() => navigate(`${EmailTemplatePath.Index}/${template._id}`)}
    >
      <span className="truncate font-medium">
        {template.name || 'Untitled'}
      </span>
    </RecordTableInlineCell>
  );
};

const emailTemplateColumns: ColumnDef<IEmailTemplate>[] = [
  {
    id: 'more',
    size: 33,
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ cell }) => (
      <EmailTemplateActions templateId={cell.row.original._id} />
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconMail} label="Name" />,
    cell: ({ cell }) => <NameCell template={cell.row.original} />,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead
        icon={IconFileDescription}
        label="Description"
      />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span className="truncate text-muted-foreground">
          {cell.row.original.description}
        </span>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'contentFormat',
    accessorKey: 'contentFormat',
    header: () => <RecordTable.InlineHead icon={IconMail} label="Editor" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">
          {FORMAT_LABEL[emailTemplateFormat(cell.row.original)]}
        </Badge>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'createdUser',
    accessorKey: 'createdUser',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Created by" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <MembersInline.Provider
          members={
            cell.row.original.createdUser ? [cell.row.original.createdUser] : []
          }
        >
          <MembersInline.Title />
        </MembersInline.Provider>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarPlus} label="Created at" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.row.original.createdAt && (
          <RelativeDateDisplay.Value
            value={dayjs(cell.row.original.createdAt).format(
              'YYYY-MM-DD HH:mm:ss',
            )}
          />
        )}
      </RecordTableInlineCell>
    ),
  },
];

export const EmailTemplatesTable = () => {
  const { emailTemplates, pageInfo, loading, error, refetch, handleFetchMore } =
    useEmailTemplates();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (error) {
    return <EmailTemplatesErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!loading && !emailTemplates.length) {
    return <EmailTemplatesEmptyState />;
  }

  return (
    <RecordTable.Provider
      columns={emailTemplateColumns}
      data={emailTemplates}
      className="m-3"
      stickyColumns={['more', 'name']}
      tableId="email_templates_record_table"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={emailTemplates.length}
        sessionKey="email-templates-cursor"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
