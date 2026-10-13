import { AutomationCanvasControlButton } from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { automationCanvasMarqueeModeState } from '@/automations/states/automationState';
import { IconFocusCentered, IconMarquee2 } from '@tabler/icons-react';
import { useReactFlow } from '@xyflow/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const AutomationCanvasViewControls = () => {
  const { t } = useTranslation('automations');
  const { fitView } = useReactFlow();
  const [isMarqueeMode, setIsMarqueeMode] = useAtom(
    automationCanvasMarqueeModeState,
  );

  return (
    <>
      <AutomationCanvasControlButton
        label={t('controls-fit-canvas')}
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
      >
        <IconFocusCentered />
      </AutomationCanvasControlButton>

      <AutomationCanvasControlButton
        label={
          isMarqueeMode
            ? t('controls-exit-marquee-select')
            : t('controls-marquee-select')
        }
        active={isMarqueeMode}
        onClick={() => setIsMarqueeMode((value) => !value)}
      >
        <IconMarquee2 />
      </AutomationCanvasControlButton>
    </>
  );
};
