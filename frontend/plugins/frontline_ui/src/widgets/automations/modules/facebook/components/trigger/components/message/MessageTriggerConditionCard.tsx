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
  // What the condition currently listens for, so it reads without opening.
  summary?: string;
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
  summary,
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
        'flex flex-row items-start gap-3 rounded border px-3 py-2.5 transition-colors',
        {
          'cursor-pointer hover:border-blue-500': !isDisabled,
          'cursor-not-allowed': isDisabled,
        },
      )}
    >
      <Checkbox
        className="mt-0.5 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
        checked={isSelected}
        disabled={isClaimed || isUnconfigured}
        onCheckedChange={onCheck}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />

      <Icon className="mt-0.5 size-4 shrink-0 text-blue-500" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
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

        {/* Once it is listening, what it listens for is the useful line. */}
        {isSelected && summary ? (
          <span className="truncate font-mono text-xs text-foreground">
            {summary}
          </span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {description}
          </span>
        )}

        {errorMessage ? (
          <p className="text-xs text-destructive">{errorMessage}</p>
        ) : null}
        {isUnconfigured && !isClaimed ? (
          <p className="text-xs text-muted-foreground">{configHint}</p>
        ) : null}
      </div>
    </div>
  );
};
