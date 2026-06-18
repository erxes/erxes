import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Attachments,
  Avatar,
  Badge,
  DropdownMenu,
  EnumCursorDirection,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  parseFilesAsAttachments,
  readImage,
  useQueryState,
} from 'erxes-ui';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { IFormSubmission } from '../types';
import {
  IconCheckbox,
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconEdit,
} from '@tabler/icons-react';

type FlatRow = { _id: string } & Record<string, unknown>;

type FieldMeta = { text: string; type: string };

const MoreColumnCell = ({ cell }: { cell: Cell<FlatRow, unknown> }) => {
  const { _id } = cell.row.original;
  const [__blank, setSubmissionId] = useQueryState<string>('submissionId');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTable.MoreButton />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="bottom" align="start">
        <DropdownMenu.Item onSelect={() => setSubmissionId(_id)}>
          <IconEdit />
          Edit
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const CheckboxCell = ({ value }: { value: string[] }) => {
  if (!value || value.length === 0) {
    return <RecordTableInlineCell>-</RecordTableInlineCell>;
  }
  return (
    <RecordTableInlineCell>
      <Badge className="rounded-lg" variant={'info'}>
        <IconCheckbox size={12} />
        {value.length} selected
      </Badge>
    </RecordTableInlineCell>
  );
};

function buildColumnsAndRows(submissions: IFormSubmission[]): {
  columns: ColumnDef<FlatRow>[];
  rows: FlatRow[];
} {
  const fieldMetaMap = new Map<string, FieldMeta>();
  for (const submission of submissions) {
    for (const item of submission.submissions) {
      if (item.formFieldText && !fieldMetaMap.has(item.formFieldText)) {
        fieldMetaMap.set(item.formFieldText, {
          text: item.formFieldText,
          type: item.formFieldType || '',
        });
      }
    }
  }

  const fields = Array.from(fieldMetaMap.values());

  const submittedAtColumn: ColumnDef<FlatRow> = {
    id: '__submittedAt',
    accessorKey: '__submittedAt',
    header: () => <RecordTable.InlineHead label="Submitted At" />,
    cell: (cell) => {
      const value = cell.getValue() as string | undefined;
      const { _id } = cell.row.original;
      const [_, setSubmissionId] = useQueryState<string>('submissionId');
      return (
        <RecordTableInlineCell
          className="truncate cursor-pointer"
          onClick={() => setSubmissionId(_id)}
        >
          {value ? (
            <RelativeDateDisplay value={value}>
              <RelativeDateDisplay.Value value={value} />
            </RelativeDateDisplay>
          ) : null}
        </RecordTableInlineCell>
      );
    },
  };

  const fieldColumns: ColumnDef<FlatRow>[] = fields.map(({ text, type }) => ({
    id: text.replace(/\s+/g, '_'),
    accessorKey: text,
    header: () => <RecordTable.InlineHead label={text} />,
    cell: ({ getValue }) => {
      const value = getValue();

      if (type === 'core:customer:avatar') {
        return (
          <RecordTableInlineCell>
            <Avatar size={'lg'}>
              <Avatar.Image
                src={readImage(decodeURIComponent(String(value ?? '')))}
                alt="avatar"
              />
              <Avatar.Fallback>C</Avatar.Fallback>
            </Avatar>
          </RecordTableInlineCell>
        );
      }

      if (type === 'file') {
        return (
          <Attachments.Inline attachments={parseFilesAsAttachments(value)} />
        );
      }

      if (type === 'core:customer:birthDate' || type === 'date') {
        const formatted =
          value && typeof value === 'string'
            ? format(new Date(value), 'MMM d, yyyy')
            : '';
        return (
          <RecordTableInlineCell className="truncate">
            {formatted}
          </RecordTableInlineCell>
        );
      }

      if (type === 'check') {
        let checks: string[] = [];
        if (value && typeof value === 'string' && value.trim() !== '') {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) checks = parsed.map(String);
          } catch {
            checks = [String(value)];
          }
        }
        return <CheckboxCell value={checks} />;
      }

      if (type === 'select') {
        let options: string[] = [];
        if (value && typeof value === 'string' && value.trim()) {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed))
              options = parsed.map(String).filter(Boolean);
            else options = [String(value)];
          } catch {
            options = [String(value)];
          }
        } else if (value) {
          options = [String(value)];
        }
        if (!options.length) {
          return <RecordTableInlineCell>-</RecordTableInlineCell>;
        }
        return (
          <RecordTableInlineCell className="flex gap-1 flex-wrap">
            {options.length === 1 ? (
              <Badge variant="info" className="rounded-lg">
                {options[0]}
              </Badge>
            ) : (
              <Badge variant="info" className="rounded-lg">
                <IconCheckbox size={12} />
                {options.length} selected
              </Badge>
            )}
          </RecordTableInlineCell>
        );
      }

      if (type === 'boolean') {
        return (
          <RecordTableInlineCell className="truncate">
            {String(value) === 'true' ? (
              <Badge variant={'success'}>
                <IconCircleDashedCheck size={16} />
              </Badge>
            ) : (
              <Badge variant="destructive">
                <IconCircleDashedX size={16} />
              </Badge>
            )}
          </RecordTableInlineCell>
        );
      }
      if (type === 'radio') {
        return (
          <RecordTableInlineCell>
            <Badge variant={'info'} className="rounded-lg">
              <IconCheckbox size={12} />
              {String(value ?? '')}
            </Badge>
          </RecordTableInlineCell>
        );
      }

      return (
        <RecordTableInlineCell className="truncate">
          {String(value ?? '')}
        </RecordTableInlineCell>
      );
    },
    size: 200,
  }));
  const moreColumns: ColumnDef<FlatRow> = {
    id: 'more',
    size: 30,
    header: () => <RecordTable.ColumnSelector />,
    cell: MoreColumnCell,
  };

  const columns: ColumnDef<FlatRow>[] = [
    moreColumns,
    submittedAtColumn,
    ...fieldColumns,
  ];

  const rows: FlatRow[] = submissions.map((submission) => {
    const row: FlatRow = {
      _id: submission._id,
      __submittedAt: submission.createdAt,
    };
    for (const item of submission.submissions) {
      if (item.formFieldText) {
        row[item.formFieldText] =
          typeof item.value === 'object'
            ? JSON.stringify(item.value)
            : item.value;
      }
    }
    return row;
  });

  return { columns, rows };
}

export const SubmissionsTable = ({
  submissions,
  loading,
  hasPreviousPage,
  hasNextPage,
  handleFetchMore,
}: {
  submissions: IFormSubmission[];
  loading?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  handleFetchMore: (params: { direction: EnumCursorDirection }) => void;
}) => {
  const { columns, rows } = useMemo(
    () => buildColumnsAndRows(submissions),
    [submissions],
  );

  if (!columns.length) return null;

  return (
    <RecordTable.Provider
      columns={columns}
      data={rows}
      className="m-3"
      stickyColumns={['more', '__submittedAt']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={rows.length}
        loading={loading}
        sessionKey="form_submissions_cursor"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={24} />
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
