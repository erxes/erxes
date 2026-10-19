import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import {
  makeBlock,
  minDurationOf,
  totalDuration,
  type Block,
} from '../bloub/engine/cycles';
import type { ExpressionId } from '../bloub/engine/expressions';
import { HUMEURS } from '../bloub/engine/gaze';
import { STATE_BY_ID, type StateId } from '../bloub/engine/states';
import {
  agentActivityState,
  type IAgentActivity,
} from '../states/agentActivityState';

/* ------------------------------------------------------------------ */
/* Pure part — no timers, no DOM: everything arrives in the input.      */
/* ------------------------------------------------------------------ */

const S = 1000; // ms per second — activity/signal times are epoch ms.

export const ERROR_EXCLAIM_MS = 6000;
export const ERROR_SAD_MS = 12000;
export const FINISHED_COMET_MS = 2400;
export const PANEL_SWIRL_MS = 1300;
export const DROPPED_WINK_MS = 1600;
export const WOKE_WIDE_MS = 800;
export const IDLE_SLEEP_MS = 180000;

/**
 * States whose pose does not loop and must be re-armed once their
 * `duration` elapses, or attention states stop moving. Read off each
 * `pose()` in the vendored states.ts: `thinking` (dotPulse) and `sleep`
 * (sin bounce) loop forever; everything else settles into a held pose.
 */
export const REARM_STATES: ReadonlySet<StateId> = new Set([
  'wink',
  'wide',
  'alert',
  'notify',
  'exclaim',
  'egg',
  'hexagon',
  'play',
  'orbit',
  'burst',
  'comet',
  'swirl',
]);

export interface IDirectorSignals {
  hovering: boolean;
  dragging: boolean;
  justDroppedAt: number | null;
  panelOpenedAt: number | null;
  triplePressedAt: number | null;
  /** ms since the last pointer/keyboard activity. */
  idleForMs: number;
  /** epoch ms of the wake event that ended a sleep spell. */
  wokeAt: number | null;
  /** current random idle mood, set by the hook's scheduler. */
  mood: ExpressionId | null;
  reducedMotion: boolean;
  /** Prepared triple-press showcase blocks (stable identity — a fresh
   * array each render would reset the avatar's montage every frame). */
  showcase?: Block[] | null;
}

export interface IDirectorInput {
  activity: IAgentActivity;
  appearanceExpression: ExpressionId;
  signals: IDirectorSignals;
}

export interface IDirectorDecision {
  state: StateId;
  /** Expression override while the state is `idle`; undefined keeps the
   * appearance default. */
  expression: ExpressionId | undefined;
  /** Eyes follow the pointer — only `idle` carries `baseFace`. */
  follow: boolean;
  /** Rule rank that produced the decision; lower preempts sooner. */
  priority: number;
  /** epoch ms of the earliest moment this decision can change — re-arm
   * or re-evaluate then. */
  until: number;
  /** Triple-press showcase: play these blocks once through the avatar. */
  showcase?: Block[];
}

export interface IDirectorPrev {
  decision: IDirectorDecision | null;
  /** epoch ms when the current state started (or last re-armed). */
  since: number;
}

const RANK = {
  dragging: 1,
  awaiting: 2,
  error: 3,
  busy: 4,
  finished: 5,
  unread: 6,
  noConnection: 7,
  panelOpened: 8,
  showcase: 9,
  dropped: 10,
  asleep: 11,
  hover: 12,
  rest: 13,
} as const;

const decide = (
  state: StateId,
  priority: number,
  expression?: ExpressionId,
): IDirectorDecision => ({
  state,
  expression,
  follow: state === 'idle',
  priority,
  until: Infinity,
});

/** The egg → hexagon → play showcase, at their measured durations. */
export const showcaseBlocks = (): Block[] => [
  makeBlock('egg'),
  makeBlock('hexagon'),
  makeBlock('play'),
];

/**
 * Pick what the bot shows. Priorities mirror the spec order: the first
 * firing rule wins, unless the current state's hold (`minDurationOf`,
 * seconds → ms) has not elapsed and the candidate is LOWER priority —
 * higher priority always preempts mid-hold.
 */
export const directBot = (
  input: IDirectorInput,
  prev: IDirectorPrev,
  now: number,
): IDirectorDecision => {
  const { activity, appearanceExpression, signals } = input;
  const { errorAt, finishedAt } = activity;

  let decision: IDirectorDecision | null = null;
  let expiry: number | null = null;

  if (signals.dragging) {
    decision = decide('wide', RANK.dragging);
  } else if (activity.phase === 'awaiting') {
    decision = decide('alert', RANK.awaiting);
  } else if (
    activity.phase === 'error' &&
    errorAt !== null &&
    now - errorAt <= ERROR_EXCLAIM_MS
  ) {
    decision = decide('exclaim', RANK.error);
    expiry = errorAt + ERROR_EXCLAIM_MS;
  } else if (
    activity.phase === 'error' &&
    errorAt !== null &&
    now - errorAt <= ERROR_SAD_MS
  ) {
    decision = decide('idle', RANK.error, 'triste');
    expiry = errorAt + ERROR_SAD_MS;
  } else if (activity.phase === 'working') {
    decision = decide('orbit', RANK.busy);
  } else if (activity.phase === 'thinking') {
    decision = decide('thinking', RANK.busy);
  } else if (
    finishedAt !== null &&
    now - finishedAt <= FINISHED_COMET_MS &&
    !signals.reducedMotion
  ) {
    decision = decide('comet', RANK.finished);
    expiry = finishedAt + FINISHED_COMET_MS;
  } else if (activity.unread > 0) {
    decision = decide('notify', RANK.unread);
  } else if (activity.hasConnection === false) {
    decision = decide('sleep', RANK.noConnection);
  } else if (
    signals.panelOpenedAt !== null &&
    now - signals.panelOpenedAt <= PANEL_SWIRL_MS &&
    !signals.reducedMotion
  ) {
    decision = decide('swirl', RANK.panelOpened);
    expiry = signals.panelOpenedAt + PANEL_SWIRL_MS;
  } else if (signals.triplePressedAt !== null) {
    const blocks = signals.showcase ?? showcaseBlocks();
    decision = { ...decide('egg', RANK.showcase), showcase: blocks };
    expiry = now + totalDuration(blocks) * S;
  } else if (
    signals.justDroppedAt !== null &&
    now - signals.justDroppedAt <= DROPPED_WINK_MS
  ) {
    decision = decide('wink', RANK.dropped);
    expiry = signals.justDroppedAt + DROPPED_WINK_MS;
  } else if (signals.idleForMs >= IDLE_SLEEP_MS) {
    decision = decide('sleep', RANK.asleep);
  } else if (signals.wokeAt !== null && now - signals.wokeAt <= WOKE_WIDE_MS) {
    decision = decide('wide', RANK.asleep);
    expiry = signals.wokeAt + WOKE_WIDE_MS;
  } else if (signals.hovering) {
    decision = decide('idle', RANK.hover, 'heureux');
  } else {
    decision = decide('idle', RANK.rest, signals.mood ?? appearanceExpression);
  }

  /**
   * Hold: don't drop to a lower-priority state before the current one's
   * floor has elapsed; a higher priority preempts immediately.
   */
  const previous = prev.decision;
  if (previous && previous.state !== decision.state) {
    const holdEnd = prev.since + minDurationOf(previous.state) * S;
    if (now < holdEnd && decision.priority > previous.priority) {
      return { ...previous, until: holdEnd };
    }
  }

  /* Earliest moment the picture can change: the chosen rule's own
   * expiry, every still-pending rule boundary, and the re-arm deadline
   * of non-looping states. */
  const boundaries: number[] = [];

  if (expiry !== null && expiry > now) boundaries.push(expiry);
  if (errorAt !== null) {
    boundaries.push(errorAt + ERROR_EXCLAIM_MS, errorAt + ERROR_SAD_MS);
  }
  if (finishedAt !== null) {
    boundaries.push(finishedAt + FINISHED_COMET_MS);
  }
  if (signals.panelOpenedAt !== null) {
    boundaries.push(signals.panelOpenedAt + PANEL_SWIRL_MS);
  }
  if (signals.justDroppedAt !== null) {
    boundaries.push(signals.justDroppedAt + DROPPED_WINK_MS);
  }
  if (signals.wokeAt !== null) {
    boundaries.push(signals.wokeAt + WOKE_WIDE_MS);
  }
  if (signals.idleForMs < IDLE_SLEEP_MS) {
    boundaries.push(now + (IDLE_SLEEP_MS - signals.idleForMs));
  }
  if (REARM_STATES.has(decision.state)) {
    const def = STATE_BY_ID.get(decision.state);
    if (def) {
      const sameState = previous?.state === decision.state;
      const started = sameState ? prev.since : now;
      // An overdue re-arm fires immediately, it is not dropped as expired.
      boundaries.push(Math.max(now + 1, started + def.duration * S));
    }
  }

  const until = boundaries
    .filter((b) => b > now)
    .reduce((min, b) => Math.min(min, b), Infinity);

  return { ...decision, until };
};

/* ------------------------------------------------------------------ */
/* Hook — owns the timers, the pointer-idle tracker and the mood deck.  */
/* ------------------------------------------------------------------ */

const MOOD_MIN_MS = 25000;
const MOOD_MAX_MS = 45000;
const MOOD_LENGTH_MS = 3000;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const subscribeReducedMotion = (onChange: () => void) => {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

export interface IUseBotDirectorSignals {
  hovering: boolean;
  dragging: boolean;
  justDroppedAt: number | null;
  panelOpenedAt: number | null;
  triplePressedAt: number | null;
  showcase?: Block[] | null;
}

export interface IUseBotDirectorResult {
  state: StateId;
  expression: ExpressionId | undefined;
  follow: boolean;
  /** Showcase blocks while the triple-press egg plays; `playing` pair. */
  showcase: Block[] | undefined;
  /** Called when the showcase cycle finishes — clears the trigger. */
  onShowcaseEnd: () => void;
  /** Bumped each time a non-looping state re-arms. */
  restartKey: number;
}

export interface IBotStatus {
  key: string;
  count?: number;
  defaultValue: string;
}

/**
 * The tray's tooltip/aria text key for the current picture, in the same
 * priority order as the director rules.
 */
export const botStatusKey = (
  activity: IAgentActivity,
  state: StateId,
): IBotStatus => {
  if (activity.phase === 'error') {
    return { key: 'status-error', defaultValue: 'Something went wrong' };
  }
  if (activity.phase === 'awaiting') {
    return { key: 'status-awaiting', defaultValue: 'Needs your approval' };
  }
  if (activity.phase === 'working') {
    return { key: 'working', defaultValue: 'Working…' };
  }
  if (activity.phase === 'thinking') {
    return { key: 'thinking', defaultValue: 'Thinking…' };
  }
  if (activity.unread > 0) {
    return {
      key: 'status-unread',
      count: activity.unread,
      defaultValue: '{{count}} new reply',
    };
  }
  if (activity.hasConnection === false) {
    return {
      key: 'status-no-connection',
      defaultValue: 'Connect an AI provider',
    };
  }
  if (state === 'sleep') {
    return {
      key: 'status-sleeping',
      defaultValue: 'Sleeping — move to wake',
    };
  }
  return { key: 'nav-label', defaultValue: 'AI Agent' };
};

const randomFraction = () =>
  crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;

const randomMoodDelay = () =>
  MOOD_MIN_MS + randomFraction() * (MOOD_MAX_MS - MOOD_MIN_MS);

export const useBotDirector = (
  signals: IUseBotDirectorSignals,
  appearanceExpression: ExpressionId,
): IUseBotDirectorResult => {
  const activity = useAtomValue(agentActivityState);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
  );

  const [, setTick] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const wokeAtRef = useRef<number | null>(null);
  const wasIdleRef = useRef(false);
  const moodRef = useRef<ExpressionId | null>(null);
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRef = useRef<IDirectorPrev>({ decision: null, since: 0 });
  const restartKeyRef = useRef(0);
  const tripleConsumedRef = useRef<number | null>(null);
  const showcaseRef = useRef<{ at: number; blocks: Block[] } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Pointer/keyboard activity: resets the idle clock, and a wake from a
   * sleep spell raises `wokeAt` for the brief `wide` reentry. */
  useEffect(() => {
    const onActivity = () => {
      const now = Date.now();
      if (wasIdleRef.current) {
        wokeAtRef.current = now;
        wasIdleRef.current = false;
        /* Wake is the only transition that needs an immediate render:
         * pointermove/wheel arrive far too often to re-render per event
         * (a remote preview pane forwards them continuously), and the
         * idle->sleep boundary is already covered by the `until` timer. */
        setTick((n) => n + 1);
      }
      lastActivityRef.current = now;
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const;
    for (const name of events) {
      window.addEventListener(name, onActivity, { passive: true });
    }
    return () => {
      for (const name of events) {
        window.removeEventListener(name, onActivity);
      }
    };
  }, []);

  const now = Date.now();
  const idleForMs = now - lastActivityRef.current;
  if (idleForMs >= IDLE_SLEEP_MS) {
    wasIdleRef.current = true;
  }

  const triplePressedAt =
    signals.triplePressedAt !== null &&
    signals.triplePressedAt !== tripleConsumedRef.current
      ? signals.triplePressedAt
      : null;

  /* The showcase blocks are created once per triple press: passing the
   * avatar a fresh array every render would re-fire its cycle effect and
   * reset the montage to block 0 every frame, so it never finished. */
  if (triplePressedAt !== null && showcaseRef.current?.at !== triplePressedAt) {
    showcaseRef.current = {
      at: triplePressedAt,
      blocks: showcaseBlocks(),
    };
  }
  const showcase =
    triplePressedAt !== null ? showcaseRef.current?.blocks ?? null : null;

  const decision = directBot(
    {
      activity,
      appearanceExpression,
      signals: {
        ...signals,
        triplePressedAt,
        showcase,
        idleForMs,
        wokeAt: wokeAtRef.current,
        mood: moodRef.current,
        reducedMotion,
      },
    },
    prevRef.current,
    now,
  );

  /* Book-keeping: a new state resets `since`; re-arming a held
   * non-looping state bumps the restart key and resets it too. */
  const previous = prevRef.current;
  const stateChanged = previous.decision?.state !== decision.state;
  const since = stateChanged ? now : previous.since;

  const rearmDue =
    previous.decision?.state === decision.state &&
    REARM_STATES.has(decision.state) &&
    now >=
      previous.since +
        (STATE_BY_ID.get(decision.state)?.duration ?? Infinity) * S;

  if (rearmDue) {
    restartKeyRef.current += 1;
  }
  prevRef.current = {
    decision,
    since: rearmDue ? now : since,
  };

  /* One timer for the earliest boundary directBot reported: re-evaluate
   * then. State stays referentially stable between re-evaluations. */
  useEffect(() => {
    if (decision.until === Infinity) return;
    const delay = Math.max(0, decision.until - Date.now());
    timerRef.current = setTimeout(() => setTick((n) => n + 1), delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [decision.until, decision.state]);

  /* Idle moods: while resting and not hovered, pick a zero-roll
   * expression from HUMEURS for a few seconds every 25–45s. */
  useEffect(() => {
    const resting =
      decision.state === 'idle' &&
      !signals.hovering &&
      decision.priority === RANK.rest;

    if (!resting) {
      moodRef.current = null;
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
      moodTimerRef.current = null;
      return;
    }

    const schedule = () => {
      moodTimerRef.current = setTimeout(() => {
        moodRef.current =
          HUMEURS[Math.floor(randomFraction() * HUMEURS.length)] ?? 'heureux';
        setTick((n) => n + 1);
        moodTimerRef.current = setTimeout(() => {
          moodRef.current = null;
          setTick((n) => n + 1);
          schedule();
        }, MOOD_LENGTH_MS);
      }, randomMoodDelay());
    };
    schedule();

    return () => {
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
      moodTimerRef.current = null;
    };
  }, [decision.state, decision.priority, signals.hovering]);

  const onShowcaseEnd = () => {
    tripleConsumedRef.current = signals.triplePressedAt;
    setTick((n) => n + 1);
  };

  return {
    state: decision.state,
    expression: decision.expression,
    follow: decision.follow,
    showcase: decision.showcase,
    onShowcaseEnd,
    restartKey: restartKeyRef.current,
  };
};
