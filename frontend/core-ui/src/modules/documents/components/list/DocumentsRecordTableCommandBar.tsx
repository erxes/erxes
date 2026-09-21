import { Row } from '@tanstack/react-table';
import { ReactElement } from 'react';
import { Can, TagsSelect } from 'ui-modules';
import { IDocument } from '../../types';
import { CommandBar, Separator, RecordTable } from 'erxes-ui';
import { getDocumentsTagOptions } from './DocumentsColumn';

/** Provides bulk tagging for selected documents. */
export function DocumentsRecordTableCommandBar(): ReactElement {
  const { table } = RecordTable.useRecordTable();
  const selectedRows: Row<IDocument>[] =
    table.getFilteredSelectedRowModel().rows;
  const documentIds = selectedRows.map((row) => row.original._id);
  const selections = selectedRows.map((row) => row.original.tagIds || []);
  const tagIds = selections.length
    ? selections.reduce(
        (common, current) => common.filter((id) => current.includes(id)),
        selections[0],
      )
    : [];

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        {selectedRows.every(
          (row) => row.original.approvalLockState?.hasAccess !== false,
        ) && (
          <Can action="tagsTag">
            <>
              <Separator.Inline />
              <TagsSelect
                type="core:documents"
                mode="multiple"
                targetIds={documentIds}
                value={tagIds}
                options={getDocumentsTagOptions(documentIds)}
                variant="secondary"
                className="shadow-none"
              />
            </>
          </Can>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
}
