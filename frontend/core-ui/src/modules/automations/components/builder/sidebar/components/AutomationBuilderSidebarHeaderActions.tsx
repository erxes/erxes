import { AutomationBuilderSecondaryPanelMenuItems } from '@/automations/components/builder/sidebar/components/AutomationBuilderSecondaryPanelMenuItems';
import { IconArrowLeft, IconDotsVertical, IconX } from '@tabler/icons-react';
import { Button, DropdownMenu, Tooltip } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export const AutomationBuilderSidebarHeaderActions = ({
  canShowSecondarySidebar,
  handleBack,
  handleClose,
}: {
  canShowSecondarySidebar: boolean;
  handleBack?: () => void;
  handleClose?: () => void;
}) => {
  const { t } = useTranslation('automations');
  return (
    <div className="flex shrink-0 flex-row gap-2 self-start">
      {canShowSecondarySidebar ? (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              size="icon"
              variant="secondary"
              aria-label={t('sidebar-more-options')}
            >
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <AutomationBuilderSecondaryPanelMenuItems />
          </DropdownMenu.Content>
        </DropdownMenu>
      ) : null}

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
