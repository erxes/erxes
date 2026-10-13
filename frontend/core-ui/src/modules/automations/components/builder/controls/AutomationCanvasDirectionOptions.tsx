import { FlowDirectionIcon } from '@/automations/components/builder/controls/canvasOptionIcons';
import { useAutomationCanvasLayout } from '@/automations/components/builder/hooks/useAutomationCanvasLayout';
import { AUTOMATION_FLOW_DIRECTIONS } from '@/automations/constants/flowDirection';
import { DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationCanvasDirectionOptions = () => {
  const { t } = useTranslation('automations');
  const { flowDirection, onFlowDirectionChange } = useAutomationCanvasLayout();

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <FlowDirectionIcon value={flowDirection} />
        {t('controls-direction')}
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent className="w-48">
        <DropdownMenu.RadioGroup
          value={flowDirection}
          onValueChange={onFlowDirectionChange}
        >
          {AUTOMATION_FLOW_DIRECTIONS.map(({ value, labelKey }) => (
            <DropdownMenu.RadioItem key={value} value={value}>
              <FlowDirectionIcon value={value} />
              {t(labelKey)}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
};
