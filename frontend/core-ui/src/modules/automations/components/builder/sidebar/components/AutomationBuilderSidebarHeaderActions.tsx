import { AutomationBuilderPanelToggles } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebarDock';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export const AutomationBuilderSidebarHeaderActions = ({
  showPanelToggles,
  handleBack,
  handleClose,
}: {
  showPanelToggles: boolean;
  handleBack?: () => void;
  handleClose?: () => void;
}) => {
  const { t } = useTranslation('automations');
  return (
    <div className="flex shrink-0 flex-row gap-2 self-start">
      {/* Mobile has no dock, so the panel toggles live in the header */}
      {showPanelToggles && (
        <AutomationBuilderPanelToggles orientation="horizontal" />
      )}

      {handleBack && (
        <HeaderActionButton label={t('sidebar-back')} onClick={handleBack}>
          <IconArrowLeft className="size-4" />
        </HeaderActionButton>
      )}

      {handleClose && (
        <HeaderActionButton label={t('sidebar-close')} onClick={handleClose}>
          <IconX className="size-4" />
        </HeaderActionButton>
      )}
    </div>
  );
};

const HeaderActionButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          size="icon"
          variant="secondary"
          aria-label={label}
          onClick={onClick}
        >
          {children}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom">{label}</Tooltip.Content>
    </Tooltip>
  );
};
