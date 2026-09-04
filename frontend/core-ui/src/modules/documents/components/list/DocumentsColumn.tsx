import {
  IconCalendarPlus,
  IconCategory,
  IconFileText,
  IconUser,
} from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useSetQueryStateByKey,
} from 'erxes-ui';
import { MembersInline } from 'ui-modules';

import { DOCUMENTS_TYPES_SET } from '../../constants';
import { IDocument } from '../../types';
import { documentsMoreColumn } from './DocumentsMoreColumn';

function DocumentNameCell({ document }: { document: IDocument }) {
  const setQuery = useSetQueryStateByKey();

  function handleClick() {
    setQuery('documentId', document._id);
    setQuery('contentType', document.contentType);
  }

  return (
    <RecordTableInlineCell onClick={handleClick}>
      <div className="flex items-center justify-between w-full gap-2">
        <span className="truncate">{document.name || 'Untitled'}</span>
      </div>
    </RecordTableInlineCell>
  );
}

function DocumentTypeCell({ row }: CellContext<IDocument, unknown>) {
  const { contentType } = row.original;
  const documentType = DOCUMENTS_TYPES_SET[contentType];
  const DocumentTypeIcon = documentType?.icon ?? IconFileText;

  return (
    <RecordTableInlineCell>
      <Badge variant="secondary" className="gap-1">
        <DocumentTypeIcon className="size-4" />
        {documentType?.label ?? contentType}
      </Badge>
    </RecordTableInlineCell>
  );
}

function DocumentCreatorCell({ row }: CellContext<IDocument, unknown>) {
  return (
    <RecordTableInlineCell>
      <MembersInline
        members={row.original.createdUser ? [row.original.createdUser] : []}
        placeholder="Unknown member"
      />
    </RecordTableInlineCell>
  );
}

function DocumentCreatedAtCell({ row }: CellContext<IDocument, unknown>) {
  const { createdAt } = row.original;

  if (!createdAt) {
    return <RecordTableInlineCell>N/A</RecordTableInlineCell>;
  }

  return (
    <RelativeDateDisplay value={createdAt} asChild>
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value value={createdAt} />
      </RecordTableInlineCell>
    </RelativeDateDisplay>
  );
}

export function DocumentsColumn(): ColumnDef<IDocument>[] {
  const checkboxColumn = RecordTable.checkboxColumn as ColumnDef<IDocument>;

  return [
    documentsMoreColumn,
    checkboxColumn,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead label="Name" icon={IconFileText} />,
      cell: ({ row }) => <DocumentNameCell document={row.original} />,
      size: 320,
    },
    {
      id: 'contentType',
      accessorKey: 'contentType',
      header: () => <RecordTable.InlineHead label="Type" icon={IconCategory} />,
      cell: DocumentTypeCell,
      size: 220,
    },
    {
      id: 'createdUser',
      accessorKey: 'createdUser',
      header: () => (
        <RecordTable.InlineHead label="Created by" icon={IconUser} />
      ),
      cell: DocumentCreatorCell,
      size: 240,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: () => (
        <RecordTable.InlineHead label="Created at" icon={IconCalendarPlus} />
      ),
      cell: DocumentCreatedAtCell,
      size: 200,
    },
  ];
}
