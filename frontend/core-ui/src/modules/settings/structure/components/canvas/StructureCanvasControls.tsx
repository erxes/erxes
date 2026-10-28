import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Panel } from '@xyflow/react';
import { Button, Tooltip } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureCanvasViewport } from '../../hooks/useStructureCanvasViewport';

const ControlButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <Button variant="ghost" size="icon" aria-label={label} onClick={onClick}>
        {children}
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
);

export const StructureCanvasControls = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { zoomPercent, zoomIn, zoomOut } = useStructureCanvasViewport();

  return (
    <Panel position="bottom-left">
      <Tooltip.Provider>
        <div className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-sm">
          <ControlButton label={t('zoom-out')} onClick={zoomOut}>
            <IconMinus />
          </ControlButton>
          <span className="min-w-11 text-center text-xs tabular-nums">
            {zoomPercent}%
          </span>
          <ControlButton label={t('zoom-in')} onClick={zoomIn}>
            <IconPlus />
          </ControlButton>
        </div>
      </Tooltip.Provider>
    </Panel>
  );
};
