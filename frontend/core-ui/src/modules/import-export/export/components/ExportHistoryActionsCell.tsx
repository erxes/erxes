import { IconDots, IconDownload } from '@tabler/icons-react';
import {
  DropdownMenu,
  REACT_APP_API_URL,
  RecordTableInlineCell,
} from 'erxes-ui';
import { TExportProgress } from 'ui-modules';

export function ExportHistoryActionsCell({
  exportItem,
}: {
  exportItem: TExportProgress;
}) {
  const canDownload = exportItem.status === 'completed' && !!exportItem.fileKey;

  if (!canDownload) {
    return (
      <RecordTableInlineCell className="justify-end text-xs text-muted-foreground" />
    );
  }

  function handleDownload() {
    if (!exportItem.fileKey) {
      return;
    }

    const fileUrl = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
      exportItem.fileKey,
    )}`;

    window.open(fileUrl, '_blank');
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTableInlineCell className="justify-center cursor-pointer">
          <IconDots className="size-4 text-muted-foreground" />
        </RecordTableInlineCell>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleDownload}>
          <IconDownload /> Download file
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
