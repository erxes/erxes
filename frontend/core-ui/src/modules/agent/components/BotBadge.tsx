import { useAtomValue } from 'jotai';
import { cn } from 'erxes-ui';
import { useReducedMotion } from 'framer-motion';

import { BloubAvatar } from '../bloub/BloubAvatar';
import type { ExpressionId } from '../bloub/engine/expressions';
import type { StateId } from '../bloub/engine/states';
import {
  agentBotAppearanceState,
  useBotPalette,
} from '../states/agentBotAppearanceState';

export interface IBotBadgeProps {
  size: number;
  state: StateId;
  /** Frozen frame in seconds — pass a `POSES` value for cheap thumbnails. */
  frozenAt?: number;
  expression?: ExpressionId;
  follow?: boolean;
  restartKey?: number | string;
  className?: string;
  /** Decorative by default: the surrounding row carries the label. */
  'aria-label'?: string;
}

/**
 * The bloub bot on its `paper` plate — the opaque backing the eye holes
 * read through. Every place the bot appears goes through this so the
 * mask backing always matches the plate.
 */
export const BotBadge = ({
  size,
  state,
  frozenAt,
  expression,
  follow,
  restartKey,
  className,
  'aria-label': ariaLabel,
}: IBotBadgeProps) => {
  const reducedMotion = useReducedMotion();
  const appearance = useAtomValue(agentBotAppearanceState);
  const { paper, color } = useBotPalette();

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        className,
      )}
      style={{ background: paper }}
    >
      <BloubAvatar
        size={size}
        state={state}
        expression={expression ?? appearance.expression}
        shape={appearance.shape}
        color={color}
        paper={paper}
        frozenAt={frozenAt ?? (reducedMotion ? 0 : undefined)}
        follow={follow}
        restartKey={restartKey}
        role={ariaLabel ? 'img' : 'presentation'}
        aria-label={ariaLabel}
      />
    </span>
  );
};
