import { Checkbox, cn } from 'erxes-ui';
import { TTriggerClaim } from '../../hooks/useFacebookBotTriggerClaims';
import { TriggerClaimNote } from './TriggerClaimNote';

type Props = {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  isSelected: boolean;
  errorMessage?: string;
  claims?: TTriggerClaim[];
  // Set when the condition carries its own configuration that is still empty.
  configHint?: string;
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
  claims,
  configHint,
  onCheck,
  onOpen,
}: Props) => {
  // Any automation already listening for this is enough to stop a second one:
  // a draft becomes active later, and nobody watches for that moment.
  // An already-selected condition stays editable, or it could never be undone.
  const isClaimed = !isSelected && Boolean(claims?.length);
  // Unconfigured conditions cannot be turned on yet.
  const isUnconfigured = !isSelected && Boolean(configHint);
  // Get Started owns no configuration, so it is the only card with nothing to
  // open. Everything else opens even when it cannot be selected.
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
        disabled={isClaimed || isUnconfigured}
        onCheckedChange={onCheck}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />

      <div className="rounded-full bg-blue-500 p-3 text-background">
        <Icon />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={cn('text-sm font-semibold text-muted-foreground', {
              'opacity-60': isClaimed,
            })}
          >
            {label}
          </p>
          <TriggerClaimNote claims={claims} />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {description}
        </span>
        {errorMessage ? (
          <p className="text-xs text-destructive">{errorMessage}</p>
        ) : null}
        {isUnconfigured && !isClaimed ? (
          <p className="mt-1 text-xs text-muted-foreground">{configHint}</p>
        ) : null}
      </div>
    </div>
  );
};
