import { AutomationCanvasControlButton } from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { automationCanvasMarqueeModeState } from '@/automations/states/automationState';
import { IconFocusCentered, IconMarquee2 } from '@tabler/icons-react';
import { useReactFlow } from '@xyflow/react';
import { useAtom } from 'jotai';

export const AutomationCanvasViewControls = () => {
  const { fitView } = useReactFlow();
  const [isMarqueeMode, setIsMarqueeMode] = useAtom(
    automationCanvasMarqueeModeState,
  );

  return (
    <>
      <AutomationCanvasControlButton
        label="Fit canvas"
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
      >
        <IconFocusCentered />
      </AutomationCanvasControlButton>

      <AutomationCanvasControlButton
        label={isMarqueeMode ? 'Exit marquee select' : 'Marquee select'}
        active={isMarqueeMode}
        onClick={() => setIsMarqueeMode((value) => !value)}
      >
        <IconMarquee2 />
      </AutomationCanvasControlButton>
    </>
  );
};
