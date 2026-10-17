import {
  botStatusKey,
  directBot,
  IDLE_SLEEP_MS,
  type IDirectorInput,
  type IDirectorPrev,
  type IDirectorSignals,
} from '../utils/botDirector';
import type { IAgentActivity } from '../states/agentActivityState';

const activity = (
  over: Partial<IAgentActivity> = {},
): IAgentActivity => ({
  phase: 'idle',
  unread: 0,
  finishedAt: null,
  errorAt: null,
  hasConnection: true,
  ...over,
});

const signals = (
  over: Partial<IDirectorSignals> = {},
): IDirectorSignals => ({
  hovering: false,
  dragging: false,
  justDroppedAt: null,
  panelOpenedAt: null,
  triplePressedAt: null,
  idleForMs: 0,
  wokeAt: null,
  mood: null,
  reducedMotion: false,
  ...over,
});

const input = (
  activityOver: Partial<IAgentActivity> = {},
  signalsOver: Partial<IDirectorSignals> = {},
): IDirectorInput => ({
  activity: activity(activityOver),
  appearanceExpression: 'neutre',
  signals: signals(signalsOver),
});

const noPrev: IDirectorPrev = { decision: null, since: 0 };
const T = 1_000_000;

describe('directBot priorities', () => {
  it('defaults to idle with the appearance expression and follow on', () => {
    const d = directBot(input(), noPrev, T);
    expect(d.state).toBe('idle');
    expect(d.expression).toBe('neutre');
    expect(d.follow).toBe(true);
  });

  it('dragging beats everything', () => {
    const d = directBot(
      input({ phase: 'awaiting' }, { dragging: true }),
      noPrev,
      T,
    );
    expect(d.state).toBe('wide');
    expect(d.follow).toBe(false);
  });

  it('awaiting beats work and error', () => {
    expect(
      directBot(input({ phase: 'awaiting' }), noPrev, T).state,
    ).toBe('alert');
  });

  it('error shows exclaim for 6s then sad idle until 12s', () => {
    const errorAt = T - 2000;
    expect(
      directBot(input({ phase: 'error', errorAt }), noPrev, T).state,
    ).toBe('exclaim');

    const sad = directBot(
      input({ phase: 'error', errorAt: T - 8000 }),
      noPrev,
      T,
    );
    expect(sad.state).toBe('idle');
    expect(sad.expression).toBe('triste');

    expect(
      directBot(input({ phase: 'error', errorAt: T - 13000 }), noPrev, T)
        .state,
    ).toBe('idle');
  });

  it('working orbits, thinking thinks', () => {
    expect(directBot(input({ phase: 'working' }), noPrev, T).state).toBe(
      'orbit',
    );
    expect(directBot(input({ phase: 'thinking' }), noPrev, T).state).toBe(
      'thinking',
    );
  });

  it('a fresh finish plays comet, skipped under reduced motion', () => {
    expect(
      directBot(input({ finishedAt: T - 1000 }), noPrev, T).state,
    ).toBe('comet');
    expect(
      directBot(
        input(
          { finishedAt: T - 1000, unread: 2 },
          { reducedMotion: true },
        ),
        noPrev,
        T,
      ).state,
    ).toBe('notify');
  });

  it('unread notifies, no connection sleeps', () => {
    expect(
      directBot(input({ unread: 3 }), noPrev, T).state,
    ).toBe('notify');
    expect(
      directBot(input({ hasConnection: false }), noPrev, T).state,
    ).toBe('sleep');
  });

  it('a just-opened panel swirls, skipped under reduced motion', () => {
    expect(
      directBot(input({}, { panelOpenedAt: T - 500 }), noPrev, T).state,
    ).toBe('swirl');
    expect(
      directBot(
        input({}, { panelOpenedAt: T - 500, reducedMotion: true }),
        noPrev,
        T,
      ).state,
    ).toBe('idle');
  });

  it('triple press returns the egg->hexagon->play showcase', () => {
    const d = directBot(input({}, { triplePressedAt: T }), noPrev, T);
    expect(d.showcase?.map((b) => b.state)).toEqual([
      'egg',
      'hexagon',
      'play',
    ]);
  });

  it('a just-dropped tray winks for its window', () => {
    expect(
      directBot(input({}, { justDroppedAt: T - 1000 }), noPrev, T).state,
    ).toBe('wink');
    expect(
      directBot(input({}, { justDroppedAt: T - 5000 }), noPrev, T).state,
    ).toBe('idle');
  });

  it('sleeps after the idle threshold and wakes through wide', () => {
    expect(
      directBot(input({}, { idleForMs: IDLE_SLEEP_MS + 1 }), noPrev, T)
        .state,
    ).toBe('sleep');
    expect(
      directBot(input({}, { wokeAt: T - 400 }), noPrev, T).state,
    ).toBe('wide');
  });

  it('hovering keeps idle with a happy face', () => {
    const d = directBot(input({}, { hovering: true }), noPrev, T);
    expect(d.state).toBe('idle');
    expect(d.expression).toBe('heureux');
    expect(d.follow).toBe(true);
  });

  it('a scheduled mood replaces the rest expression', () => {
    const d = directBot(input({}, { mood: 'hilare' }), noPrev, T);
    expect(d.state).toBe('idle');
    expect(d.expression).toBe('hilare');
  });
});

describe('directBot hold rule', () => {
  const exclaimPrev: IDirectorPrev = {
    decision: {
      state: 'exclaim',
      expression: undefined,
      follow: false,
      priority: 3,
      until: Infinity,
    },
    since: T - 300,
  };

  it('keeps a higher-priority state for its minimum duration', () => {
    // exclaim (priority 3) has 0.6s of hold left vs a rest candidate.
    const d = directBot(input(), exclaimPrev, T);
    expect(d.state).toBe('exclaim');
  });

  it('lets a higher priority preempt mid-hold', () => {
    // awaiting (priority 2) > error (3): it does not wait out the hold.
    const d = directBot(input({ phase: 'awaiting' }), exclaimPrev, T);
    expect(d.state).toBe('alert');
  });

  it('lets the lower priority through once the hold elapsed', () => {
    const d = directBot(
      input(),
      { ...exclaimPrev, since: T - 5000 },
      T,
    );
    expect(d.state).toBe('idle');
  });
});

describe('directBot re-arm timing', () => {
  it('arms a non-looping attention state to re-arm at its duration', () => {
    // alert lasts 2.4s — the caller re-arms then to keep the "!" moving.
    const d = directBot(input({ phase: 'awaiting' }), noPrev, T);
    expect(d.state).toBe('alert');
    expect(d.until).toBeLessThanOrEqual(T + 2401);
    expect(d.until).toBeGreaterThan(T);
  });

  it('leaves looping states without a re-arm deadline of their own', () => {
    const d = directBot(input({ phase: 'thinking' }), noPrev, T);
    expect(d.state).toBe('thinking');
    // no state boundary pending → no earlier re-evaluation is forced
    expect(d.until).toBeGreaterThan(T + IDLE_SLEEP_MS - 1);
  });

  it('never returns a past deadline for an overdue re-arm', () => {
    // A re-arm state held far past its duration (e.g. an eval was
    // skipped while the tab was throttled) must clamp its boundary to
    // the future — a `until <= now` would fire a 0ms timer loop.
    const heldAlert: IDirectorPrev = {
      decision: directBot(input({ phase: 'awaiting' }), noPrev, T - 100_000),
      since: T - 100_000,
    };
    const d = directBot(input({ phase: 'awaiting' }), heldAlert, T);
    expect(d.state).toBe('alert');
    expect(d.until).toBeGreaterThan(T);
  });

  it('keeps a stable re-arm boundary between re-evaluations', () => {
    // started = prev.since, not now: re-evaluating before the deadline
    // must not push the re-arm back — otherwise every render resets it.
    // (evaluated after the 1.1s hold, before the 2.4s re-arm)
    const first = directBot(input({ phase: 'awaiting' }), noPrev, T);
    const second = directBot(
      input({ phase: 'awaiting' }),
      { decision: first, since: T },
      T + 1200,
    );
    expect(second.until).toBe(T + 2400);
  });
});

describe('botStatusKey', () => {
  it('follows the same priority order', () => {
    expect(
      botStatusKey(activity({ phase: 'awaiting' }), 'alert').key,
    ).toBe('status-awaiting');
    expect(
      botStatusKey(activity({ phase: 'error' }), 'exclaim').key,
    ).toBe('status-error');
    expect(botStatusKey(activity({ unread: 4 }), 'notify')).toEqual(
      expect.objectContaining({ key: 'status-unread', count: 4 }),
    );
    expect(
      botStatusKey(activity({ hasConnection: false }), 'sleep').key,
    ).toBe('status-no-connection');
    expect(botStatusKey(activity(), 'sleep').key).toBe('status-sleeping');
    expect(botStatusKey(activity(), 'idle').key).toBe('nav-label');
  });
});
