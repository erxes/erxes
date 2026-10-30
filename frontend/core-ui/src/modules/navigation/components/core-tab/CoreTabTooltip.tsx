import { Kbd, Tooltip } from 'erxes-ui';

// The hover label every top bar icon shows, with its shortcut when it has one.
export const CoreTabTooltip = ({
  label,
  shortcut,
  children,
}: {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
    <Tooltip.Content side="bottom" className="flex items-center gap-2">
      {label}
      {shortcut && <Kbd>{shortcut}</Kbd>}
    </Tooltip.Content>
  </Tooltip>
);
