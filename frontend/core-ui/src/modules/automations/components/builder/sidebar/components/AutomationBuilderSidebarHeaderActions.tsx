import { AutomationBuilderSecondarySidebarToggle } from '@/automations/components/builder/sidebar/components/AutomationBuilderSecondarySidebarToggle';
import { ActionErrorPolicyMenuItem } from '@/automations/components/builder/sidebar/components/content/action/ActionErrorPolicyMenuItem';
import { ActionErrorPolicySheet } from '@/automations/components/builder/sidebar/components/content/action/ActionErrorPolicySheet';
import { IconArrowLeft, IconDotsVertical, IconX } from '@tabler/icons-react';
import { Button, DropdownMenu, Tooltip } from 'erxes-ui';
import { ReactNode, useState } from 'react';

export const AutomationBuilderSidebarHeaderActions = ({
  canShowSecondarySidebar,
  handleBack,
  handleClose,
}: {
  canShowSecondarySidebar: boolean;
  handleBack?: () => void;
  handleClose?: () => void;
}) => {
  const [isErrorPolicyOpen, setIsErrorPolicyOpen] = useState(false);

  return (
    <div className="flex shrink-0 flex-row gap-2 self-start">
      {canShowSecondarySidebar ? (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button size="icon" variant="secondary" aria-label="More options">
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <AutomationBuilderSecondarySidebarToggle />
            <ActionErrorPolicyMenuItem
              onSelect={() => setIsErrorPolicyOpen(true)}
            />
          </DropdownMenu.Content>
        </DropdownMenu>
      ) : null}

      {handleBack && (
        <HeaderActionButton label="Back" onClick={handleBack}>
          <IconArrowLeft className="size-4" />
        </HeaderActionButton>
      )}

      {handleClose && (
        <HeaderActionButton label="Close" onClick={handleClose}>
          <IconX className="size-4" />
        </HeaderActionButton>
      )}

      <ActionErrorPolicySheet
        open={isErrorPolicyOpen}
        onOpenChange={setIsErrorPolicyOpen}
      />
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
