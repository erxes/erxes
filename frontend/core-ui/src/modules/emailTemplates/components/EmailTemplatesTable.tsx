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
  Spinner,
} from 'erxes-ui';
import { useNavigate } from 'react-router';
import { MembersInline } from 'ui-modules';

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

const getColumns = (
  onRemove: (id: string) => void,
): ColumnDef<IEmailTemplate>[] => [
  {
    id: 'more',
    size: 33,
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ cell }) => (
      <EmailTemplateActions
        templateId={cell.row.original._id}
        onRemove={onRemove}
      />
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

export const EmailTemplatesTable = ({
  templates,
  loading,
  onRemove,
}: {
  templates: IEmailTemplate[];
  loading: boolean;
  onRemove: (id: string) => void;
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={getColumns(onRemove)}
      data={templates}
      className="m-3 h-full"
      stickyColumns={['more', 'name']}
      tableId="email_templates_record_table"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};
