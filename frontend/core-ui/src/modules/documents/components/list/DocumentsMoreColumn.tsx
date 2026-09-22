import { DocumentsActions } from '@/documents/components/DocumentsActions';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';

import { IDocument } from '../../types';

export function DocumentsMoreColumnCell({
  row,
}: CellContext<IDocument, unknown>) {
  return <DocumentsActions documentItem={row.original} variant="table" />;
}

export const documentsMoreColumn: ColumnDef<IDocument> = {
  id: 'more',
  size: 33,
  cell: DocumentsMoreColumnCell,
  header: () => <RecordTable.ColumnSelector />,
};
