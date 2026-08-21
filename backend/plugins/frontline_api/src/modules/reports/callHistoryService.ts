import {
  ICall,
  ICdrLeg,
  agentOf,
  detectCarrier,
} from '@/reports/callReportService';
import { callRingSeconds } from '@/integrations/call/services/cdrUtils';

const RINGING_LASTAPPS = ['Queue', 'Dial'];

export interface ICallHistoryEntry {
  uniqueid: string;
  startedAt: Date | null;
  endedAt: Date | null;
  customerPhone: string | null;
  customerName: string | null;
  customerId: string | null;
  carrier: string;
  direction: string;
  outcome: string;
  isAnswered: boolean;
  waitTime: number | null;
  talkTime: number;
  agentExtension: string | null;
  agentName: string | null;
  rungCount: number;
  queue: string | null;
  recordUrl: string | null;
  conversationId: string | null;
  repeatCount: number;
  repeatAnswered: number;
}

export const groupLegsByCall = (legs: ICdrLeg[]): Map<string, ICdrLeg[]> => {
  const byCall = new Map<string, ICdrLeg[]>();

  for (const leg of legs) {
    if (!leg.uniqueid) continue;
    byCall.set(leg.uniqueid, [...(byCall.get(leg.uniqueid) ?? []), leg]);
  }

  return byCall;
};

export const rungExtensionCount = (legs: ICdrLeg[]): number => {
  const extensions = new Set<string>();

  for (const leg of legs) {
    if (!RINGING_LASTAPPS.includes(leg.lastapp ?? '')) continue;
    const extension = agentOf(leg);
    if (extension) extensions.add(extension);
  }

  return extensions.size;
};

export const countRepeatCallers = (
  calls: ICall[],
): Map<string, { total: number; answered: number }> => {
  const byPhone = new Map<string, { total: number; answered: number }>();

  for (const call of calls) {
    if (!call.customerPhone) continue;
    const seen = byPhone.get(call.customerPhone) ?? { total: 0, answered: 0 };
    seen.total += 1;
    if (call.isAnswered) seen.answered += 1;
    byPhone.set(call.customerPhone, seen);
  }

  return byPhone;
};

export interface IBuildEntriesArgs {
  calls: ICall[];
  legsByCall: Map<string, ICdrLeg[]>;

  outcomeByCall: Map<string, string>;
  repeats: Map<string, { total: number; answered: number }>;
  customerNamesByPhone: Map<string, { _id: string; name: string }>;
  agentNamesByExtension: Map<string, string>;
}

export const buildCallHistoryEntries = ({
  calls,
  legsByCall,
  outcomeByCall,
  repeats,
  customerNamesByPhone,
  agentNamesByExtension,
}: IBuildEntriesArgs): ICallHistoryEntry[] =>
  calls.map((call) => {
    const legs = legsByCall.get(call.uniqueid) ?? [];
    const phone = call.customerPhone;
    const contact = phone ? customerNamesByPhone.get(phone) : undefined;
    const repeat = phone ? repeats.get(phone) : undefined;

    return {
      uniqueid: call.uniqueid,
      startedAt: call.start,
      endedAt: call.end,
      customerPhone: phone,
      customerName: contact?.name ?? null,
      customerId: contact?._id ?? null,
      carrier: detectCarrier(phone),
      direction: call.direction === 'Outbound' ? 'outgoing' : 'incoming',

      outcome: outcomeByCall.get(call.uniqueid) ?? 'MISSED',
      isAnswered: call.isAnswered,

      waitTime: call.isAnswered ? call.waitTime : callRingSeconds(legs),
      talkTime: call.billsec,
      agentExtension: call.agent,
      agentName: call.agent
        ? (agentNamesByExtension.get(call.agent) ?? null)
        : null,
      rungCount: rungExtensionCount(legs),
      queue: call.queue,
      recordUrl: call.recordUrl,
      conversationId: call.conversationId,
      repeatCount: repeat?.total ?? 1,
      repeatAnswered: repeat?.answered ?? 0,
    };
  });
