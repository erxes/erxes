import { BlockEditorReadOnly } from 'erxes-ui';
import { useGetNote } from '@/task/hooks/useGetNote';

interface NoteInputReadOnlyProps {
  newValueId: string;
}

export const NoteInputReadOnly = ({
  newValueId,
}: NoteInputReadOnlyProps) => {
  const { note, loading } = useGetNote(newValueId);

  return (
    <div className="flex flex-col border rounded-lg min-h-14 px-4 py-3  ml-4">
      {!loading && (
        <BlockEditorReadOnly
          content={note?.content || ''}
          className="read-only"
        />
      )}
    </div>
  );
};

// TODO: add options menu

// const NoteOptionsMenu = () => {
//   return (
//     <DropdownMenu>
//       <DropdownMenu.Trigger asChild>
//         <Button
//           variant="secondary"
//           className={'w-full font-medium size-8 flex-shrink-0'}
//           size="icon"
//         >
//           <IconDots />
//         </Button>
//       </DropdownMenu.Trigger>
//       <DropdownMenu.Content
//         side="right"
//         className="min-w-48 text-sm"
//         sideOffset={8}
//         alignOffset={-4}
//         align="start"
//       >
//         <DropdownMenu.Item>
//           <IconEdit />
//           Edit
//         </DropdownMenu.Item>
//         <DropdownMenu.Item
//           className="text-destructive"
//         >
//           <IconTrash />
//           Delete
//         </DropdownMenu.Item>
//       </DropdownMenu.Content>
//     </DropdownMenu>
//   );
// };
