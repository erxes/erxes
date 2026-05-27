import { Checkbox, cn } from 'erxes-ui';

type Props = {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  isSelected: boolean;
  errorMessage?: string;
  onCheck: (checked: boolean) => void;
  onOpen: () => void;
};

export const MessageTriggerConditionCard = ({
  type,
  label,
  description,
  icon: Icon,
  isSelected,
  errorMessage,
  onCheck,
  onOpen,
}: Props) => {
  const isDisabled = type === 'getStarted';

  return (
    <div
      role={isDisabled ? undefined : 'button'}
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      onClick={(e) => {
        e.preventDefault();

        if (isDisabled) {
          return;
        }

        onOpen();
      }}
      onKeyDown={(e) => {
        if (isDisabled) {
          return;
        }

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        'flex flex-row items-center gap-4 rounded border p-4 transition-all duration-300 ease-in-out',
        {
          'cursor-pointer hover:border-blue-500': !isDisabled,
          'cursor-not-allowed': isDisabled,
        },
      )}
    >
      <Checkbox
        className="data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
        checked={isSelected}
        onCheckedChange={onCheck}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />

      <div className="rounded-full bg-blue-500 p-3 text-background">
        <Icon />
      </div>

      <div>
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <span className="font-mono text-xs text-muted-foreground">
          {description}
        </span>
        {errorMessage ? (
          <p className="text-xs text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
};
