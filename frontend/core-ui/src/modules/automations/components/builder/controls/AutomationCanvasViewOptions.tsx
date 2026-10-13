import { useAutomationCanvasViewOptions } from '@/automations/components/builder/hooks/useAutomationCanvasViewOptions';
import { IconGridDots, IconMap } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationCanvasViewOptions = () => {
  const { t } = useTranslation('automations');
  const { showGrid, showMiniMap, toggleGrid, toggleMiniMap } =
    useAutomationCanvasViewOptions();

  return (
    <>
      <DropdownMenu.Item onClick={toggleMiniMap}>
        <IconMap className="size-4" />
        {showMiniMap ? t('controls-hide-minimap') : t('controls-show-minimap')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={toggleGrid}>
        <IconGridDots className="size-4" />
        {showGrid ? t('controls-hide-grid') : t('controls-show-grid')}
      </DropdownMenu.Item>
    </>
  );
};
