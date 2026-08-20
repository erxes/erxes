import { useAutomationCanvasExport } from '@/automations/components/builder/hooks/useAutomationCanvasExport';
import {
  IconBraces,
  IconDownload,
  IconPhoto,
  IconVectorBezier2,
} from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';

export const AutomationCanvasDownloadOptions = () => {
  const { onExportPng, onExportSvg, onExportJson } =
    useAutomationCanvasExport();

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <IconDownload className="size-4" />
        Download
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent className="w-48">
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <IconPhoto className="size-4" />
            PNG
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent className="w-48">
            <DropdownMenu.Item
              onClick={() => onExportPng({ withBackground: true })}
            >
              With background
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => onExportPng({ withBackground: false })}
            >
              Transparent
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Item onClick={onExportSvg}>
          <IconVectorBezier2 className="size-4" />
          SVG
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={onExportJson}>
          <IconBraces className="size-4" />
          Export JSON
        </DropdownMenu.Item>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
};
