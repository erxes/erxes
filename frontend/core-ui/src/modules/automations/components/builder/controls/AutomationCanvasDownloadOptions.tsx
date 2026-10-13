import { useAutomationCanvasExport } from '@/automations/components/builder/hooks/useAutomationCanvasExport';
import {
  IconBraces,
  IconDownload,
  IconPhoto,
  IconVectorBezier2,
} from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationCanvasDownloadOptions = () => {
  const { t } = useTranslation('automations');
  const { onExportPng, onExportSvg, onExportJson } =
    useAutomationCanvasExport();

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <IconDownload className="size-4" />
        {t('controls-download')}
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
              {t('controls-png-with-background')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => onExportPng({ withBackground: false })}
            >
              {t('controls-png-transparent')}
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Item onClick={onExportSvg}>
          <IconVectorBezier2 className="size-4" />
          SVG
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={onExportJson}>
          <IconBraces className="size-4" />
          {t('controls-export-json')}
        </DropdownMenu.Item>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
};
