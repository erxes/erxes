import { BotBadge } from './BotBadge';
import { POSES } from '../bloub/engine/states';

/** Older turns are still thumbnails; only the current turn runs Bloub's clock. */
export const AgentMessageIdentity = ({
  activity,
  current = false,
}: {
  activity?: string;
  current?: boolean;
}) => {
  const working = Boolean(activity);
  return (
    <div className="mb-3 flex min-w-0 items-center gap-2.5">
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
