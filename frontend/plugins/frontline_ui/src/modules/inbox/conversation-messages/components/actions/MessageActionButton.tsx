import { Button, Tooltip } from 'erxes-ui';

export const ActionButton = ({
  label,
  disabled,
  children,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={label}
          onClick={onClick}
          className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {children}
        </Button>
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
);
