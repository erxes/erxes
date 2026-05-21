import { ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  Badge,
  EnumCursorDirection,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  readImage,
} from 'erxes-ui';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { IFormSubmission } from '../types';
import { AttachmentsPreview } from './attachments-preview';

type FlatRow = { _id: string } & Record<string, unknown>;

type FieldMeta = { text: string; type: string };

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
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      return (
        <RecordTableInlineCell className="truncate">
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
    id: text,
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
          <RecordTableInlineCell>
            <AttachmentsPreview value={getValue()} readImage={readImage}>
              <AttachmentsPreview.InlineCell fallback="No files" />
            </AttachmentsPreview>
          </RecordTableInlineCell>
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
        const checks = useMemo((): string[] => {
          if (!value) return [];

          if (typeof value === 'string' && value.trim() !== '') {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) return parsed;
            } catch {
              return [value];
            }
          }

          return [];
        }, [value]);
        return (
          <RecordTableInlineCell className="truncate">
            {checks.map((check, index) => (
              <Badge key={index}>{check}</Badge>
            ))}
          </RecordTableInlineCell>
        );
      }
      if (type === 'boolean') {
        return (
          <RecordTableInlineCell className="truncate">
            {String(value) === 'true' ? (
              <Badge variant={'success'}>Yes</Badge>
            ) : (
              <Badge variant="destructive">No</Badge>
            )}
          </RecordTableInlineCell>
        );
      }

      return (
        <RecordTableInlineCell className="truncate">
          {String(value ?? '')}
        </RecordTableInlineCell>
      );
    },
  }));

  const columns: ColumnDef<FlatRow>[] = [...fieldColumns, submittedAtColumn];

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
    <RecordTable.Provider columns={columns} data={rows} className="m-3">
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
