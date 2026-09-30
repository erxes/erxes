import { callRingSeconds } from '@/integrations/call/services/cdrUtils';
import {
  ICall,
  ICdrLeg,
  NO_QUEUE,
  agentOf,
  foldLegsIntoCalls,
} from '@/reports/callReportService';
import { groupLegsByCall } from '@/reports/callHistoryService';

const PBX_OFFSET_MS = 8 * 60 * 60 * 1000;

export const MISSED_REASONS = [
  'SHORT_HANGUP',
  'VOICEMAIL',
  'BUSY',
  'FAILED',
  'IVR',
  'NOT_PICKED_UP',
  'QUEUE_ABANDON',
] as const;

export type MissedReason = (typeof MISSED_REASONS)[number];

const AGENT_LASTAPPS = ['Queue', 'Dial'];

export const SLA_DEFAULT_SHORT_ABANDON_SECONDS = 5;

export const SLA_DEFAULT_CALLBACK_WINDOW_MINUTES = 60;

export const SLA_DEFAULT_BREACH_LIMIT = 50;

export const SLA_MAX_BREACH_LIMIT = 5000;

const SLA_MAX_SECONDS = 3600;

const SLA_MAX_CALLBACK_WINDOW_MINUTES = 24 * 60;

export interface ISlaOptions {
  shortAbandonSeconds?: number | null;
  callbackWindowMinutes?: number | null;
  breachLimit?: number | null;
  agentExtension?: string | null;
  knownExtensions?: Set<string>;
  now?: Date;
}

interface ISlaCall {
  call: ICall;
  wait: number;
  isShortAbandon: boolean;
  isCalledBack: boolean;
  isPendingCallback: boolean;
  missedReason: MissedReason | null;
}

export interface ISlaTotals {
  totalCalls: number;
  offeredCalls: number;
  answeredCalls: number;
  abandonedCalls: number;
  shortAbandonedCalls: number;
  calledBackCalls: number;
  pendingCallbacks: number;
  breachedCalls: number;
  serviceLevel: number | null;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

const clampNumber = (
  value: number | null | undefined,
  fallback: number,
  max: number,
): number =>
  Number.isFinite(value) && Number(value) >= 0
    ? Math.min(Number(value), max)
    : fallback;

export const resolveCallbackWindowMinutes = (
  value: number | null | undefined,
): number =>
  clampNumber(
    value,
    SLA_DEFAULT_CALLBACK_WINDOW_MINUTES,
    SLA_MAX_CALLBACK_WINDOW_MINUTES,
  );

const clampLimit = (value: number | null | undefined): number =>
  Number.isFinite(value) && Number(value) > 0
    ? Math.min(Math.floor(Number(value)), SLA_MAX_BREACH_LIMIT)
    : SLA_DEFAULT_BREACH_LIMIT;

const pbxDayStart = (date: Date): Date => {
  const local = new Date(date.getTime() + PBX_OFFSET_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) -
      PBX_OFFSET_MS,
  );
};

export const normalizeSlaPhone = (phone?: string | null): string | null => {
  const digits = String(phone ?? '').replace(/\D/g, '');
  const national =
    digits.length === 11 && digits.startsWith('976') ? digits.slice(3) : digits;
  const trimmed = national.replace(/^0+/, '');

  return trimmed || null;
};

const abandonedWaitSeconds = (call: ICall, legs: ICdrLeg[]): number =>
  callRingSeconds(legs) ?? call.duration ?? 0;

const pbxHour = (date: Date): number =>
  new Date(date.getTime() + PBX_OFFSET_MS).getUTCHours();

export const missedReasonOf = (
  legs: ICdrLeg[],
  wait: number,
  shortAbandonSeconds: number,
  knownExtensions?: Set<string>,
): MissedReason => {
  if (wait < shortAbandonSeconds) return 'SHORT_HANGUP';

  const dispositions = legs.map((leg) =>
    String(leg.disposition ?? '').toUpperCase(),
  );

  const reachedVoicemail = legs.some(
    (leg, index) =>
      String(leg.actionType ?? '').includes('VM') &&
      dispositions[index] === 'ANSWERED',
  );
  if (reachedVoicemail) return 'VOICEMAIL';

  if (dispositions.includes('BUSY')) return 'BUSY';
  if (dispositions.includes('FAILED')) return 'FAILED';

  const agentLegs = legs.filter((leg) =>
    AGENT_LASTAPPS.includes(leg.lastapp ?? ''),
  );
  if (!agentLegs.length) return 'IVR';

  const rangAgent = agentLegs.some((leg) => {
    const extension = agentOf(leg, knownExtensions);
    return Boolean(
      extension && (!knownExtensions?.size || knownExtensions.has(extension)),
    );
  });

  return rangAgent ? 'NOT_PICKED_UP' : 'QUEUE_ABANDON';
};

const indexCallbacks = (outboundLegs: ICdrLeg[]): Map<string, number[]> => {
  const byPhone = new Map<string, number[]>();

  for (const call of foldLegsIntoCalls(outboundLegs)) {
    if (call.direction !== 'Outbound' || !call.isAnswered || !call.start) {
      continue;
    }

    const phone = normalizeSlaPhone(call.customerPhone);
    if (!phone) continue;

    byPhone.set(phone, [...(byPhone.get(phone) ?? []), call.start.getTime()]);
  }

  return byPhone;
};

const classifyCalls = (
  legs: ICdrLeg[],
  outboundLegs: ICdrLeg[],
  {
    shortAbandonSeconds,
    callbackWindowMs,
    knownExtensions,
    now,
  }: {
    shortAbandonSeconds: number;
    callbackWindowMs: number;
    knownExtensions?: Set<string>;
    now: number;
  },
): ISlaCall[] => {
  const legsByCall = groupLegsByCall(legs);
  const callbacksByPhone = callbackWindowMs
    ? indexCallbacks(outboundLegs)
    : new Map<string, number[]>();

  return foldLegsIntoCalls(legs, knownExtensions)
    .filter((call) => call.direction === 'Inbound')
    .map((call) => {
      if (call.isAnswered) {
        return {
          call,
          wait: call.waitTime,
          isShortAbandon: false,
          isCalledBack: false,
          isPendingCallback: false,
          missedReason: null,
        };
      }

      const callLegs = legsByCall.get(call.uniqueid) ?? [];
      const wait = abandonedWaitSeconds(call, callLegs);
      const isShortAbandon = wait < shortAbandonSeconds;
      const missedAt = (call.end ?? call.start)?.getTime();
      const phone = normalizeSlaPhone(call.customerPhone);

      const awaitsCallback =
        Boolean(callbackWindowMs) && !isShortAbandon && missedAt !== undefined;

      const isCalledBack =
        awaitsCallback &&
        Boolean(phone) &&
        (callbacksByPhone.get(phone ?? '') ?? []).some(
          (calledAt) =>
            calledAt >= Number(missedAt) &&
            calledAt <= Number(missedAt) + callbackWindowMs,
        );

      return {
        call,
        wait,
        isShortAbandon,
        isCalledBack,
        isPendingCallback:
          awaitsCallback &&
          !isCalledBack &&
          now < Number(missedAt) + callbackWindowMs,
        missedReason: missedReasonOf(
          callLegs,
          wait,
          shortAbandonSeconds,
          knownExtensions,
        ),
      };
    });
};

const isOffered = ({ isShortAbandon }: ISlaCall): boolean => !isShortAbandon;

const isServed = ({ call, isCalledBack }: ISlaCall): boolean =>
  call.isAnswered || isCalledBack;

const summarise = (calls: ISlaCall[]): ISlaTotals => {
  const offered = calls.filter(isOffered);
  const answered = offered.filter(isServed);
  const calledBack = calls.filter(({ isCalledBack }) => isCalledBack);

  return {
    totalCalls: calls.length,
    offeredCalls: offered.length,
    answeredCalls: answered.length,
    abandonedCalls:
      calls.filter(({ call }) => !call.isAnswered).length - calledBack.length,
    shortAbandonedCalls: calls.filter(({ isShortAbandon }) => isShortAbandon)
      .length,
    calledBackCalls: calledBack.length,
    pendingCallbacks: calls.filter(({ isPendingCallback }) => isPendingCallback)
      .length,
    breachedCalls: offered.length - answered.length,
    serviceLevel: offered.length
      ? round2((answered.length / offered.length) * 100)
      : null,
  };
};

const groupBy = <K>(
  calls: ISlaCall[],
  keyOf: (call: ISlaCall) => K | null,
): Map<K, ISlaCall[]> => {
  const grouped = new Map<K, ISlaCall[]>();

  for (const call of calls) {
    const key = keyOf(call);
    if (key === null) continue;
    grouped.set(key, [...(grouped.get(key) ?? []), call]);
  }

  return grouped;
};

export const buildSlaReport = (
  legs: ICdrLeg[],
  options: ISlaOptions = {},
  outboundLegs: ICdrLeg[] = [],
) => {
  const shortAbandonSeconds = clampNumber(
    options.shortAbandonSeconds,
    SLA_DEFAULT_SHORT_ABANDON_SECONDS,
    SLA_MAX_SECONDS,
  );
  const callbackWindowMinutes = resolveCallbackWindowMinutes(
    options.callbackWindowMinutes,
  );
  const breachLimit = clampLimit(options.breachLimit);

  const classified = classifyCalls(legs, outboundLegs, {
    shortAbandonSeconds,
    callbackWindowMs: callbackWindowMinutes * 60 * 1000,
    knownExtensions: options.knownExtensions,
    now: (options.now ?? new Date()).getTime(),
  });

  const agents = [
    ...new Set(
      classified
        .map(({ call }) => call.agent)
        .filter((agent): agent is string => Boolean(agent)),
    ),
  ].sort();

  const agentExtension =
    options.agentExtension && options.agentExtension !== 'all'
      ? options.agentExtension
      : null;

  const calls = agentExtension
    ? classified.filter(({ call }) => call.agent === agentExtension)
    : classified;

  const series = [
    ...groupBy(calls, ({ call }) =>
      call.start ? pbxDayStart(call.start).getTime() : null,
    ).entries(),
  ]
    .sort(([a], [b]) => a - b)
    .map(([day, dayCalls]) => {
      const totals = summarise(dayCalls);

      return {
        day: new Date(day),
        offeredCalls: totals.offeredCalls,
        answeredCalls: totals.answeredCalls,
        breachedCalls: totals.breachedCalls,
        serviceLevel: totals.serviceLevel,
      };
    });

  const queues = [
    ...groupBy(calls, ({ call }) => call.queue ?? NO_QUEUE).entries(),
  ]
    .map(([queue, queueCalls]) => ({ queue, ...summarise(queueCalls) }))
    .sort((a, b) => {
      if (a.queue === NO_QUEUE) return 1;
      if (b.queue === NO_QUEUE) return -1;
      return a.queue.localeCompare(b.queue);
    });

  const breaches = calls
    .filter((call) => isOffered(call) && !isServed(call))
    .sort(
      (a, b) => (b.call.start?.getTime() ?? 0) - (a.call.start?.getTime() ?? 0),
    );

  const missed = calls.filter(
    (call): call is ISlaCall & { missedReason: MissedReason } =>
      call.missedReason !== null,
  );

  const missedReasons = MISSED_REASONS.map((reason) => {
    const reasonCalls = missed.filter((call) => call.missedReason === reason);

    return {
      reason,
      count: reasonCalls.length,
      calledBack: reasonCalls.filter(({ isCalledBack }) => isCalledBack).length,
    };
  }).filter(({ count }) => count > 0);

  const missedByHour = [
    ...groupBy(missed, ({ call, missedReason }) =>
      call.start ? `${pbxHour(call.start)}:${missedReason}` : null,
    ).entries(),
  ]
    .map(([key, hourCalls]) => {
      const [hour, reason] = key.split(':');
      return { hour: Number(hour), reason, count: hourCalls.length };
    })
    .sort((a, b) => a.hour - b.hour || a.reason.localeCompare(b.reason));

  return {
    shortAbandonSeconds,
    callbackWindowMinutes,
    agents,
    missedReasons,
    missedByHour,
    summary: summarise(calls),
    series,
    queues,
    breachCount: breaches.length,
    breaches: breaches
      .slice(0, breachLimit)
      .map(({ call, wait, isPendingCallback }) => ({
        uniqueid: call.uniqueid,
        startedAt: call.start,
        customerPhone: call.customerPhone,
        queue: call.queue,
        agent: call.agent,
        waitTime: round2(wait),
        isPendingCallback,
      })),
  };
};
