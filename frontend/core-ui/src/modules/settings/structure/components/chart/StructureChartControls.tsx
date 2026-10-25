import {
  IconChevronsDown,
  IconChevronsUp,
  IconFocusCentered,
  IconMinus,
  IconPencil,
  IconPlus,
} from '@tabler/icons-react';
import { Panel } from '@xyflow/react';
import { Button, Separator, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useStructureChartContext } from '../../contexts/StructureChartContext';
import { useStructureChartViewport } from '../../hooks/useStructureChartViewport';

type TControlButtonProps = {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

const ControlButton = ({ label, onClick, children }: TControlButtonProps) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <Button variant="ghost" size="icon" aria-label={label} onClick={onClick}>
        {children}
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
);

export const StructureChartControls = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { zoomPercent, zoomIn, zoomOut, fitView } = useStructureChartViewport();
  const { canEdit, editMode, toggleEditMode, expandAll, collapseAll } =
    useStructureChartContext();

  return (
    <Panel position="bottom-center">
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
          <Separator orientation="vertical" className="mx-1 h-4" />
          <ControlButton label={t('fit-view')} onClick={fitView}>
            <IconFocusCentered />
          </ControlButton>
          <ControlButton label={t('expand-all')} onClick={expandAll}>
            <IconChevronsDown />
          </ControlButton>
          <ControlButton label={t('collapse-all')} onClick={collapseAll}>
            <IconChevronsUp />
          </ControlButton>
          {canEdit && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Button
                variant={editMode ? 'secondary' : 'ghost'}
                size="sm"
                aria-pressed={editMode}
                onClick={toggleEditMode}
              >
                <IconPencil />
                {t('edit-structure')}
              </Button>
            </>
          )}
        </div>
      </Tooltip.Provider>
    </Panel>
  );
};
