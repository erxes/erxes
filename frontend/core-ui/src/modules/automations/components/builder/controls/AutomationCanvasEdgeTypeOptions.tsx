import { EdgeTypeIcon } from '@/automations/components/builder/controls/canvasOptionIcons';
import { useAutomationCanvasLayout } from '@/automations/components/builder/hooks/useAutomationCanvasLayout';
import { AUTOMATION_EDGE_TYPES } from '@/automations/constants/edgeTypes';
import { IconVectorBezier2 } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationCanvasEdgeTypeOptions = () => {
  const { t } = useTranslation('automations');
  const { edgeType, onEdgeTypeChange } = useAutomationCanvasLayout();

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <IconVectorBezier2 className="size-4" />
        {t('controls-edge-type')}
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent className="w-48">
        <DropdownMenu.RadioGroup
          value={edgeType}
          onValueChange={onEdgeTypeChange}
        >
          {AUTOMATION_EDGE_TYPES.map(({ value, labelKey }) => (
            <DropdownMenu.RadioItem key={value} value={value}>
              <EdgeTypeIcon value={value} />
              {t(labelKey)}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
};
