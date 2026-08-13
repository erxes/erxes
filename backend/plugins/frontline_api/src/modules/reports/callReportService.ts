import { escapeRegExp } from 'erxes-api-shared/utils';
import {
  callSpeedOfAnswer,
  isHumanAnsweredLeg,
} from '@/integrations/call/services/cdrUtils';

const PBX_OFFSET_MS = 8 * 60 * 60 * 1000;

export const CDR_REPORT_FIELDS =
  'uniqueid actionType userfield disposition lastapp billsec duration start answer end src dst dstchannelExt recordUrl conversationId';

export interface ICallReportArgs {
  startDate: string;
  endDate: string;
  queueId?: string;
  direction?: string;
}

export interface ICdrLeg {
  uniqueid?: string;
  actionType?: string;
  userfield?: string;
  disposition?: string;
  lastapp?: string;
  billsec?: number;
  duration?: number;
  start?: Date;
  answer?: Date;
  end?: Date;
  src?: string;
  dst?: string;
  dstchannelExt?: string;
  recordUrl?: string;
  conversationId?: string;
}

export interface ICall {
  uniqueid: string;
  queue: string | null;
  direction: string;
  dispositions: string[];
  lastapps: string[];
  billsec: number;
  duration: number;

  waitTime: number;
  isAnswered: boolean;
  agent: string | null;
  customerPhone: string | null;
  start: Date | null;
  end: Date | null;

  recordUrl: string | null;

  conversationId: string | null;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

const percentage = (part: number, whole: number): number =>
  whole > 0 ? round2((part / whole) * 100) : 0;

const average = (total: number, count: number): number =>
  count > 0 ? round2(total / count) : 0;

export const buildCdrFilter = ({
  startDate,
  endDate,
  queueId,
  direction,
}: ICallReportArgs): Record<string, unknown> => {
  const filter: Record<string, unknown> = {
    start: { $gte: new Date(startDate), $lt: new Date(endDate) },
  };

  if (direction && direction !== 'all') {
    filter.userfield = direction;
  }

  if (queueId && queueId !== 'all') {
    filter.actionType = { $regex: `QUEUE\\[${escapeRegExp(queueId)}\\]` };
  }

  return filter;
};

export const queueOf = (leg: ICdrLeg): string | null =>
  /QUEUE\[([^\]]+)\]/.exec(leg.actionType ?? '')?.[1] ?? null;

const isExtension = (value?: string): boolean =>
  /^[0-9]{4}$/.test(String(value ?? ''));

const RINGING_LASTAPPS = ['Queue', 'Dial'];

export const agentOf = (leg: ICdrLeg): string | null => {
  if (leg.userfield === 'Outbound' && isExtension(leg.src)) {
    return String(leg.src);
  }
  if (isExtension(leg.dstchannelExt)) return String(leg.dstchannelExt);
  if (isExtension(leg.dst)) return String(leg.dst);
  return null;
};

const customerPhoneOf = (leg: ICdrLeg): string | null =>
  (leg.userfield === 'Inbound' ? leg.src : leg.dst) ?? null;

export const foldLegsIntoCalls = (legs: ICdrLeg[]): ICall[] => {
  const calls = new Map<string, ICall>();
  const legsByCall = new Map<string, ICdrLeg[]>();

  for (const leg of legs) {
    if (!leg.uniqueid) continue;

    const call = calls.get(leg.uniqueid) ?? {
      uniqueid: leg.uniqueid,
      queue: null,
      direction: leg.userfield ?? 'Inbound',
      dispositions: [],
      lastapps: [],
      billsec: 0,
      duration: 0,
      waitTime: 0,
      isAnswered: false,
      agent: null,
      customerPhone: null,
      start: null,
      end: null,
      recordUrl: null,
      conversationId: null,
    };

    call.queue = call.queue ?? queueOf(leg);
    call.customerPhone = call.customerPhone ?? customerPhoneOf(leg);
    call.conversationId = call.conversationId ?? leg.conversationId ?? null;

    if (leg.disposition && !call.dispositions.includes(leg.disposition)) {
      call.dispositions.push(leg.disposition);
    }
    if (leg.lastapp && !call.lastapps.includes(leg.lastapp)) {
      call.lastapps.push(leg.lastapp);
    }

    call.duration = Math.max(call.duration, leg.duration ?? 0);

    if (isHumanAnsweredLeg(leg)) {
      call.isAnswered = true;

      call.billsec = Math.max(call.billsec, leg.billsec ?? 0);

      call.agent = agentOf(leg) ?? call.agent;

      call.recordUrl = leg.recordUrl ?? call.recordUrl;
    }

    if (leg.start && (!call.start || leg.start < call.start)) {
      call.start = leg.start;
    }
    if (leg.end && (!call.end || leg.end > call.end)) {
      call.end = leg.end;
    }

    calls.set(leg.uniqueid, call);
    legsByCall.set(leg.uniqueid, [
      ...(legsByCall.get(leg.uniqueid) ?? []),
      leg,
    ]);
  }

  for (const call of calls.values()) {
    const callLegs = legsByCall.get(call.uniqueid) ?? [];

    if (!call.agent) {
      call.agent =
        callLegs
          .filter((leg) => RINGING_LASTAPPS.includes(leg.lastapp ?? ''))
          .map(agentOf)
          .find(Boolean) ?? null;
    }

    call.waitTime = callSpeedOfAnswer(callLegs) ?? 0;
  }

  return [...calls.values()];
};

export const summariseQueueStats = (calls: ICall[]) => {
  const byQueue = new Map<string, ICall[]>();

  for (const call of calls) {
    const queue = call.queue;
    if (!queue) continue;
    byQueue.set(queue, [...(byQueue.get(queue) ?? []), call]);
  }

  return [...byQueue.entries()]
    .map(([queue, queueCalls]) => {
      const answered = queueCalls.filter((call) => call.isAnswered);
      const abandoned = queueCalls.filter((call) => !call.isAnswered);

      const totalWaitTime = answered.reduce(
        (sum, call) => sum + call.waitTime,
        0,
      );
      const totalTalkTime = answered.reduce(
        (sum, call) => sum + call.billsec,
        0,
      );

      return {
        queue,
        totalCalls: queueCalls.length,
        answeredCalls: answered.length,
        answeredRate: percentage(answered.length, queueCalls.length),
        abandonedCalls: abandoned.length,
        abandonedRate: percentage(abandoned.length, queueCalls.length),
        averageWaitTime: average(totalWaitTime, answered.length),
        averageTalkTime: average(totalTalkTime, answered.length),
      };
    })
    .sort((a, b) => a.queue.localeCompare(b.queue));
};

export const summariseAgentStats = (
  calls: ICall[],
  agentId?: string | null,
  agentExtensions?: Set<string>,
) => {
  const byAgent = new Map<string, ICall[]>();

  for (const call of calls) {
    const agent = call.agent;
    if (!agent) continue;
    if (agentId && agent !== agentId) continue;
    if (agentExtensions?.size && !agentExtensions.has(agent)) continue;
    byAgent.set(agent, [...(byAgent.get(agent) ?? []), call]);
  }

  return [...byAgent.entries()]
    .map(([agent, agentCalls]) => {
      const answered = agentCalls.filter((call) => call.isAnswered);
      const missed = agentCalls.filter((call) => !call.isAnswered);

      const talkTimes = answered.map((call) => call.billsec);
      const totalTalkTime = talkTimes.reduce((sum, value) => sum + value, 0);
      const totalWaitTime = answered.reduce(
        (sum, call) => sum + call.waitTime,
        0,
      );

      return {
        agent,
        totalCalls: agentCalls.length,
        answeredCalls: answered.length,
        answeredRate: percentage(answered.length, agentCalls.length),
        missedCalls: missed.length,
        missedRate: percentage(missed.length, agentCalls.length),
        totalTalkTime,
        averageTalkTime: average(totalTalkTime, answered.length),
        totalWaitTime,
        averageWaitTime: average(totalWaitTime, answered.length),
        shortestCall: talkTimes.length ? Math.min(...talkTimes) : 0,
        longestCall: talkTimes.length ? Math.max(...talkTimes) : 0,
      };
    })
    .sort((a, b) => a.agent.localeCompare(b.agent));
};

export const CALLBACK_WINDOW_MS = 24 * 60 * 60 * 1000;

export const summariseCallbackStats = (
  inboundCalls: ICall[],
  outboundCalls: ICall[],
  queue: string,
) => {
  const missed = inboundCalls.filter((call) => !call.isAnswered);

  const callbacksByNumber = new Map<string, ICall[]>();
  for (const call of outboundCalls) {
    if (!call.customerPhone || !call.start) continue;
    callbacksByNumber.set(call.customerPhone, [
      ...(callbacksByNumber.get(call.customerPhone) ?? []),
      call,
    ]);
  }

  let callbackAttempts = 0;
  let successfulCallbacks = 0;
  let totalCallbackMinutes = 0;
  let timedCallbacks = 0;

  for (const call of missed) {
    const missedAt = (call.end ?? call.start)?.getTime();
    if (!call.customerPhone || !missedAt) continue;

    const attempts = (callbacksByNumber.get(call.customerPhone) ?? [])
      .filter((callback) => {
        const calledAt = callback.start?.getTime() ?? 0;
        return (
          calledAt >= missedAt && calledAt <= missedAt + CALLBACK_WINDOW_MS
        );
      })
      .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));

    if (!attempts.length) continue;

    callbackAttempts += 1;
    if (attempts.some((callback) => callback.isAnswered)) {
      successfulCallbacks += 1;
    }

    totalCallbackMinutes +=
      ((attempts[0].start?.getTime() ?? missedAt) - missedAt) / 60000;
    timedCallbacks += 1;
  }

  return [
    {
      queue,
      totalMissedCalls: missed.length,
      callbackAttempts,
      successfulCallbacks,
      callbackRate: percentage(successfulCallbacks, missed.length),
      pendingCallbacks: missed.length - callbackAttempts,
      averageCallbackTime: average(totalCallbackMinutes, timedCallbacks),
    },
  ];
};

const pbxDayStart = (date: Date): Date => {
  const local = new Date(date.getTime() + PBX_OFFSET_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) -
      PBX_OFFSET_MS,
  );
};

const pbxDayAndHour = (date: Date): { dow: number; hour: number } => {
  const local = new Date(date.getTime() + PBX_OFFSET_MS);
  const day = local.getUTCDay();
  return { dow: day === 0 ? 7 : day, hour: local.getUTCHours() };
};

export const buildVolumeSeries = (calls: ICall[]) => {
  const byDay = new Map<number, ICall[]>();

  for (const call of calls) {
    if (!call.start) continue;
    const day = pbxDayStart(call.start).getTime();
    byDay.set(day, [...(byDay.get(day) ?? []), call]);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, dayCalls]) => ({
      day: new Date(day),
      incoming: dayCalls.filter((call) => call.direction === 'Inbound').length,
      outgoing: dayCalls.filter((call) => call.direction === 'Outbound').length,
      answered: dayCalls.filter((call) => call.isAnswered).length,
      abandoned: dayCalls.filter(
        (call) => call.direction === 'Inbound' && !call.isAnswered,
      ).length,
    }));
};

const CARRIER_BY_PREFIX: Record<string, string> = {
  '85': 'Mobicom',
  '94': 'Mobicom',
  '95': 'Mobicom',
  '99': 'Mobicom',
  '80': 'Unitel',
  '86': 'Unitel',
  '88': 'Unitel',
  '89': 'Unitel',
  '90': 'Skytel',
  '91': 'Skytel',
  '92': 'Skytel',
  '96': 'Skytel',
  '83': 'G-Mobile',
  '93': 'G-Mobile',
  '97': 'G-Mobile',
  '98': 'G-Mobile',
  '60': 'Ondo',
  '66': 'Ondo',
};

export const detectCarrier = (phone?: string | null): string => {
  const digits = String(phone ?? '').replace(/\D/g, '');

  const national =
    digits.length === 11 && digits.startsWith('976') ? digits.slice(3) : digits;

  if (national.startsWith('696')) return 'Skytel';

  return CARRIER_BY_PREFIX[national.slice(0, 2)] ?? 'Other';
};

export const buildCarrierBreakdown = (calls: ICall[]) => {
  const byCarrier = new Map<string, number>();

  for (const call of calls) {
    const carrier = detectCarrier(call.customerPhone);
    byCarrier.set(carrier, (byCarrier.get(carrier) ?? 0) + 1);
  }

  return [...byCarrier.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const buildHeatmap = (calls: ICall[]) => {
  const cells = new Map<
    string,
    { dow: number; hour: number; calls: ICall[] }
  >();

  for (const call of calls) {
    if (!call.start) continue;
    const { dow, hour } = pbxDayAndHour(call.start);
    const key = `${dow}:${hour}`;
    const cell = cells.get(key) ?? { dow, hour, calls: [] };
    cell.calls.push(call);
    cells.set(key, cell);
  }

  return [...cells.values()].map(({ dow, hour, calls: cellCalls }) => {
    const answered = cellCalls.filter((call) => call.isAnswered).length;

    return {
      dow,
      hour,
      total: cellCalls.length,
      answered,
      answerRate: percentage(answered, cellCalls.length),
    };
  });
};

export const buildTopNumbers = (calls: ICall[], limit: number) => {
  const byNumber = new Map<string, ICall[]>();

  for (const call of calls) {
    if (!call.customerPhone) continue;
    byNumber.set(call.customerPhone, [
      ...(byNumber.get(call.customerPhone) ?? []),
      call,
    ]);
  }

  return [...byNumber.entries()]
    .map(([number, numberCalls]) => {
      const answered = numberCalls.filter((call) => call.isAnswered);

      return {
        number,
        carrier: detectCarrier(number),
        attempts: numberCalls.length,
        answered: answered.length,
        missed: numberCalls.length - answered.length,
        duration: answered.reduce((sum, call) => sum + call.billsec, 0),
      };
    })
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, limit);
};
