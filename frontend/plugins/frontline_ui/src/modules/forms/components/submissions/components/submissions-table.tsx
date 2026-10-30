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
  isDefined,
  parseFilesAsAttachments,
  readImage,
  useQueryState,
} from 'erxes-ui';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IFormSubmission } from '../types';
import type { IFormField } from '@/forms/types/formTypes';
import {
  IconCheckbox,
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconEdit,
} from '@tabler/icons-react';

type FlatRow = { _id: string } & Record<string, unknown>;

const MoreColumnCell = ({ cell }: { cell: Cell<FlatRow, unknown> }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const { _id } = cell.row.original;
  const [, setSubmissionId] = useQueryState<string>('submissionId');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTable.MoreButton />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="bottom" align="start">
        <DropdownMenu.Item onSelect={() => setSubmissionId(_id)}>
          <IconEdit />
          {t('edit', 'Edit')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const CheckboxCell = ({ value }: { value: string[] }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  if (!value || value.length === 0) {
    return <RecordTableInlineCell>-</RecordTableInlineCell>;
  }
  return (
    <RecordTableInlineCell>
      <Badge className="rounded-lg" variant={'info'}>
        <IconCheckbox size={12} />
        {t('n-selected', '{{count}} selected', { count: value.length })}
      </Badge>
    </RecordTableInlineCell>
  );
};

function buildColumnsAndRows(
  submissions: IFormSubmission[],
  fields: IFormField[],
): {
  columns: ColumnDef<FlatRow>[];
  rows: FlatRow[];
} {
  const submittedAtColumn: ColumnDef<FlatRow> = {
    id: '__submittedAt',
    accessorKey: '__submittedAt',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
      return (
        <RecordTable.InlineHead label={t('submitted-at', 'Submitted At')} />
      );
    },
    cell: function SubmittedAtCell(cell) {
      const value = cell.getValue() as string | undefined;
      const { _id } = cell.row.original;
      const [, setSubmissionId] = useQueryState<string>('submissionId');
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

  const fieldColumns: ColumnDef<FlatRow>[] = fields.map((field) => ({
    id: field._id,
    accessorFn: (row) => row[field._id],
    header: () => <RecordTable.InlineHead label={field.text || field._id} />,
    cell: ({ getValue }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline', {
        keyPrefix: 'modules.forms',
      });
      const value = getValue();

      if (value === null || value === undefined || value === '') {
        return <RecordTableInlineCell />;
      }

      if (field.type === 'core:customer:avatar') {
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

      if (field.type === 'file') {
        return (
          <Attachments.Inline attachments={parseFilesAsAttachments(value)} />
        );
      }

      if (field.type === 'core:customer:birthDate' || field.type === 'date') {
        const date = typeof value === 'string' ? new Date(value) : undefined;
        const formatted =
          date && !Number.isNaN(date.getTime())
            ? format(date, 'MMM d, yyyy')
            : String(value);
        return (
          <RecordTableInlineCell className="truncate">
            {formatted}
          </RecordTableInlineCell>
        );
      }

      if (field.type === 'check') {
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

      if (field.type === 'select') {
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
                {t('n-selected', '{{count}} selected', {
                  count: options.length,
                })}
              </Badge>
            )}
          </RecordTableInlineCell>
        );
      }

      if (field.type === 'boolean') {
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
      if (field.type === 'radio') {
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
    size: 33,
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
    for (const item of (submission.submissions ?? []).filter(isDefined)) {
      if (item.formFieldId) {
        row[item.formFieldId] =
          item.value !== null && typeof item.value === 'object'
            ? JSON.stringify(item.value)
            : item.value;
      }
    }
    return row;
  });

  return { columns, rows };
}

export const SubmissionsTable = ({
  fields,
  submissions,
  loading,
  hasPreviousPage,
  hasNextPage,
  handleFetchMore,
}: {
  fields: (IFormField | null)[];
  submissions: IFormSubmission[];
  loading?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  handleFetchMore: (params: { direction: EnumCursorDirection }) => void;
}) => {
  const { columns, rows } = useMemo(
    () => buildColumnsAndRows(submissions, fields.filter(isDefined)),
    [submissions, fields],
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
