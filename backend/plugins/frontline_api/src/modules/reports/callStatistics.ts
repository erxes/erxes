import {
  ICdrLegTiming,
  averageSpeedOfAnswer,
  callSpeedOfAnswer,
  isHumanAnsweredLeg,
} from '@/integrations/call/services/cdrUtils';

export interface IStatisticsLeg extends ICdrLegTiming {
  userfield?: string;
  src?: string;
}

const AFTER_CALL_WORK_SECONDS = 180;

const SERVICE_LEVEL_TARGET_SECONDS = 20;

const groupLegsIntoCalls = (legs: IStatisticsLeg[]): IStatisticsLeg[][] => {
  const byCall = new Map<string, IStatisticsLeg[]>();

  for (const leg of legs) {
    if (!leg.uniqueid) continue;
    byCall.set(leg.uniqueid, [...(byCall.get(leg.uniqueid) ?? []), leg]);
  }

  return [...byCall.values()];
};

const isInbound = (call: IStatisticsLeg[]): boolean =>
  call.some((leg) => leg.userfield === 'Inbound');

const wasAnswered = (call: IStatisticsLeg[]): boolean =>
  call.some(isHumanAnsweredLeg);

const talkSeconds = (call: IStatisticsLeg[]): number =>
  Math.max(
    0,
    ...call.filter(isHumanAnsweredLeg).map((leg) => Number(leg.billsec) || 0),
  );

const inboundCalls = (legs: IStatisticsLeg[]): IStatisticsLeg[][] =>
  groupLegsIntoCalls(legs).filter(isInbound);

export const calculateServiceLevel = async (legs: IStatisticsLeg[]) => {
  const answered = inboundCalls(legs).filter(wasAnswered);

  if (!answered.length) return null;

  const withinTarget = answered.filter(
    (call) =>
      (callSpeedOfAnswer(call) ?? Infinity) <= SERVICE_LEVEL_TARGET_SECONDS,
  );

  return (withinTarget.length / answered.length) * 100;
};

export const calculateFirstCallResolution = async (legs: IStatisticsLeg[]) => {
  const answered = inboundCalls(legs).filter(wasAnswered);

  const callsPerCaller = new Map<string, number>();
  for (const call of answered) {
    const caller = call.find((leg) => leg.src)?.src;
    if (!caller) continue;
    callsPerCaller.set(caller, (callsPerCaller.get(caller) ?? 0) + 1);
  }

  if (!callsPerCaller.size) return null;

  const resolvedFirstTime = [...callsPerCaller.values()].filter(
    (count) => count === 1,
  ).length;

  return (resolvedFirstTime / callsPerCaller.size) * 100;
};

export const calculateAbandonmentRate = async (legs: IStatisticsLeg[]) => {
  const inbound = inboundCalls(legs);

  if (!inbound.length) return null;

  const abandoned = inbound.filter((call) => !wasAnswered(call));

  return (abandoned.length / inbound.length) * 100;
};

export const calculateOccupancyRate = async (
  legs: IStatisticsLeg[],
  workingHours = 8,
) => {
  const workingSeconds = workingHours * 3600;
  const answered = inboundCalls(legs).filter(wasAnswered);

  if (!workingSeconds || !answered.length) return null;

  const handledSeconds = inboundCalls(legs)
    .filter(wasAnswered)
    .reduce(
      (sum, call) => sum + talkSeconds(call) + AFTER_CALL_WORK_SECONDS,
      0,
    );

  return (handledSeconds / workingSeconds) * 100;
};

export const calculateAverageSpeedOfAnswer = async (legs: IStatisticsLeg[]) => {
  const inbound = legs.filter((leg) => leg.userfield === 'Inbound');

  if (!inbound.some(isHumanAnsweredLeg)) return null;

  return averageSpeedOfAnswer(inbound);
};

export const calculateAverageHandlingTime = async (legs: IStatisticsLeg[]) => {
  const answered = inboundCalls(legs).filter(wasAnswered);

  if (!answered.length) return null;

  return (
    answered.reduce((sum, call) => sum + talkSeconds(call), 0) / answered.length
  );
};
