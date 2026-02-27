import { RecordTable } from 'erxes-ui';
import { pagesColumns } from './PagesColumn';

import { PagesCommandbar } from './pages-command-bar/PagesCommandBar';
import { PAGES_CURSOR_SESSION_KEY } from '../constants/pagesCursorSessionKey';
import { usePages } from '../hooks/usePages';

interface PagesRecordTableProps {
  clientPortalId: string;
  onEditPage?: (page: any) => void;
}

export const PagesRecordTable = ({
  clientPortalId,
  onEditPage,
}: PagesRecordTableProps) => {
  const { pages, loading, refetch, pageInfo, handleFetchMore } = usePages({
    variables: {
      clientPortalId,
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const columns = pagesColumns(onEditPage, refetch);

  return (
    <RecordTable.Provider
      columns={columns}
      data={pages || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={pages?.length}
        sessionKey={PAGES_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <PagesCommandbar refetch={refetch} />
    </RecordTable.Provider>
  );
};

// import {
//   Button,
//   RecordTable,
//   RecordTableInlineCell,
//   Popover,
//   Input,
//   Spinner,
// } from 'erxes-ui';
// import {
//   IconEdit,
//   IconTrash,
//   IconUser,
//   IconArticle,
//   IconCalendar,
//   IconDots,
// } from '@tabler/icons-react';
// import { useState } from 'react';
// import { ColumnDef } from '@tanstack/react-table';
// import { useConfirm } from 'erxes-ui/hooks/use-confirm';
// import { usePages } from '../hooks/usePages';
// import { useRemovePage } from '../hooks/useRemovePage';
// import { useEditPage } from '../hooks/useEditPage';
// import { PagesCommandBar } from './PageCommandBar';
// import { IPage, IPagesRecordTableProps } from '../types/pageTypes';

// const BadgeCell = ({ children }: { children: React.ReactNode }) => (
//   <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
//     <span className="text-sm text-gray-500">{children}</span>
//   </div>
// );

// const formatDate = (dateString: string) => {
//   if (!dateString) return '';
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//   });
// };

// export const PagesRecordTable = ({
//   clientPortalId,
//   onEdit,
// }: IPagesRecordTableProps) => {
//   const { pages, loading } = usePages(clientPortalId);
//   const { confirm } = useConfirm();

//   const [editingCell, setEditingCell] = useState<{
//     rowId: string;
//     value: string;
//   } | null>(null);

//   const { removePage } = useRemovePage(clientPortalId);

//   const { editPage } = useEditPage();

//   const checkboxColumn = RecordTable.checkboxColumn as ColumnDef<IPage>;

//   const columns: ColumnDef<IPage>[] = [
//     checkboxColumn,
//     {
//       id: 'name',
//       header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
//       accessorKey: 'name',
//       cell: ({ cell }) => {
//         const original = cell.row.original as IPage;
//         const isOpen = editingCell?.rowId === original._id;
//         const currentValue =
//           editingCell?.rowId === original._id && editingCell
//             ? editingCell.value
//             : (cell.getValue() as string);

//         const onSave = async () => {
//           if (currentValue !== (original.name || '')) {
//             await editPage({
//               variables: { _id: original._id, input: { name: currentValue } },
//             });
//           }
//           setEditingCell(null);
//         };

//         return (
//           <Popover
//             open={isOpen}
//             onOpenChange={(v) => {
//               if (v) {
//                 setEditingCell({
//                   rowId: original._id,
//                   value: cell.getValue() as string,
//                 });
//               } else {
//                 onSave();
//               }
//             }}
//           >
//             <RecordTableInlineCell.Trigger>
//               <span>{cell.getValue() as string}</span>
//             </RecordTableInlineCell.Trigger>
//             <RecordTableInlineCell.Content>
//               <Input
//                 value={currentValue}
//                 onChange={(e) =>
//                   setEditingCell({
//                     rowId: original._id,
//                     value: e.currentTarget.value,
//                   })
//                 }
//               />
//             </RecordTableInlineCell.Content>
//           </Popover>
//         );
//       },
//     },
//     {
//       id: 'slug',
//       header: () => <RecordTable.InlineHead icon={IconArticle} label="Slug" />,
//       accessorKey: 'slug',
//       cell: ({ cell }) => (
//         <BadgeCell>{(cell.getValue() as string) || ''}</BadgeCell>
//       ),
//     },

//     {
//       id: 'createdAt',
//       header: () => (
//         <RecordTable.InlineHead icon={IconCalendar} label="Created" />
//       ),
//       accessorKey: 'createdAt',
//       cell: ({ cell }) => (
//         <BadgeCell>{formatDate(cell.getValue() as string)}</BadgeCell>
//       ),
//     },
//     {
//       id: 'updatedAt',
//       header: () => (
//         <RecordTable.InlineHead icon={IconCalendar} label="Updated" />
//       ),
//       accessorKey: 'updatedAt',
//       cell: ({ cell }) => (
//         <BadgeCell>{formatDate(cell.getValue() as string)}</BadgeCell>
//       ),
//     },
//     {
//       id: 'actions',
//       header: () => <RecordTable.InlineHead label="Actions" icon={IconDots} />,
//       cell: ({ row }) => {
//         const onEditClick = () => {
//           onEdit(row.original);
//         };
//         const onRemove = () => {
//           confirm({
//             message: 'Are you sure you want to delete this page?',
//           }).then(async () => {
//             await removePage(row.original._id);
//           });
//         };
//         return (
//           <div className="flex px-2 items-center gap-1">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="inline-flex items-center justify-center gap-2 px-3 whitespace-nowrap rounded text-sm transition-colors outline-offset-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 font-medium cursor-pointer shadow-sm bg-background shadow-button-outline hover:bg-accent h-7 w-7"
//               onClick={onEditClick}
//             >
//               <IconEdit className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="icon"
//               className="inline-flex items-center justify-center gap-2 px-3 whitespace-nowrap rounded text-sm transition-colors outline-offset-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 font-medium cursor-pointer h-7 w-7 text-destructive bg-destructive/10 hover:bg-destructive/20"
//               onClick={onRemove}
//             >
//               <IconTrash className="h-4 w-4" />
//             </Button>
//           </div>
//         );
//       },
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex w-full h-full justify-center items-center">
//         <div className="text-gray-500">
//           <Spinner />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 rounded-lg shadow-sm border overflow-hidden h-full">
//       <RecordTable.Provider
//         columns={columns}
//         data={pages || []}
//         className="h-full m-0"
//         stickyColumns={['checkbox', 'name']}
//       >
//         <RecordTable>
//           <RecordTable.Header />
//           <RecordTable.Body>
//             <RecordTable.RowList />
//           </RecordTable.Body>
//         </RecordTable>

//         <PagesCommandBar
//           onBulkDelete={async (ids: string[]) => {
//             for (const id of ids) {
//               await removePage(id);
//             }
//           }}
//         />
//       </RecordTable.Provider>
//     </div>
//   );
// };
