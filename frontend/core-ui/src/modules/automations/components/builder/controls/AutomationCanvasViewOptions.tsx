import { useAutomationCanvasViewOptions } from '@/automations/components/builder/hooks/useAutomationCanvasViewOptions';
import { IconGridDots, IconMap } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';

export const AutomationCanvasViewOptions = () => {
  const { showGrid, showMiniMap, toggleGrid, toggleMiniMap } =
    useAutomationCanvasViewOptions();

  return (
    <>
      <DropdownMenu.Item onClick={toggleMiniMap}>
        <IconMap className="size-4" />
        {showMiniMap ? 'Hide minimap' : 'Show minimap'}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={toggleGrid}>
        <IconGridDots className="size-4" />
        {showGrid ? 'Hide grid' : 'Show grid'}
      </DropdownMenu.Item>
    </>
  );
};
