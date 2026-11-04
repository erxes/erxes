import { BotBadge } from './BotBadge';
import { POSES } from '../bloub/engine/states';

/**
 * Older turns are still thumbnails; only the current turn runs Bloub's clock.
 * Spacing belongs to the caller: the avatar shares a row with the turn's
 * activity header, or stands alone above a plain answer.
 */
export const AgentMessageIdentity = ({
  activity,
  current = false,
}: {
  activity?: string;
  current?: boolean;
}) => {
  const working = Boolean(activity);
  return (
    <div className="flex shrink-0 items-center">
      <BotBadge
        size={36}
        state={working ? 'thinking' : 'idle'}
        frozenAt={current ? undefined : POSES.idle}
        follow={current && !working}
        className="ring-1 ring-border/60"
      />
      {activity && (
        <span role="status" className="sr-only">
          {activity}
        </span>
      )}
    </div>
  );
};
