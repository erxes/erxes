import { IconDotsVertical, IconFileText } from '@tabler/icons-react';
import { DropdownMenu, RecordTableInlineCell } from 'erxes-ui';
import { TImportProgress } from 'ui-modules';

export function ImportHistoryActionsCell({
  importItem,
}: {
  importItem: TImportProgress;
}) {
  const canOpenErrorFile = !!importItem.errorFileUrl;

  if (!canOpenErrorFile) {
    return (
      <RecordTableInlineCell className="justify-end text-xs text-muted-foreground" />
    );
  }

  function handleOpenErrorFile() {
    if (!importItem.errorFileUrl) {
      return;
    }

    window.open(importItem.errorFileUrl, '_blank');
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTableInlineCell className="justify-center cursor-pointer">
          <IconDotsVertical className="size-4 text-muted-foreground" />
        </RecordTableInlineCell>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleOpenErrorFile}>
          <IconFileText /> Open error file
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
