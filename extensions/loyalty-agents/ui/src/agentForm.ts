import type { BadgeProps } from 'erxes-ui';
import * as z from 'zod';
import type { AgentInput, AgentStatus, StoredAgent } from './api';

export const AGENT_STATUSES: AgentStatus[] = ['active', 'draft', 'archived'];

export const AGENT_STATUS_OPTIONS: Record<
  AgentStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  active: { label: 'Active', variant: 'success' },
  draft: { label: 'Draft', variant: 'warning' },
  archived: { label: 'Archived', variant: 'secondary' },
};

export const findAgentStatus = (value: string) =>
  AGENT_STATUSES.find((status) => status === value);

const optionalNumber = z
  .string()
  .refine((value) => value.trim() === '' || !Number.isNaN(Number(value)), {
    message: 'Enter a number',
  });

// Form fields stay strings so an empty input is distinct from 0. The server
// checks the business rules; this only catches what a form can.
export const AgentFormSchema = z.object({
  number: z.string().trim().min(1, 'Enter an agent number'),
  status: z.enum(['active', 'draft', 'archived']),
  hasReturn: z.boolean(),
  returnAmount: optionalNumber,
  returnPercent: optionalNumber,
  prepaidPercent: optionalNumber,
  discountPercent: optionalNumber,
});

export type AgentFormValues = z.infer<typeof AgentFormSchema>;

const numberToText = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

const textToNumber = (value: string) =>
  value.trim() === '' ? null : Number(value);

export const toFormValues = (agent: StoredAgent | null): AgentFormValues => ({
  number: agent?.number ?? '',
  status: agent?.status ?? 'draft',
  hasReturn: agent?.hasReturn ?? true,
  returnAmount: numberToText(agent?.returnAmount),
  returnPercent: numberToText(agent?.returnPercent),
  prepaidPercent: numberToText(agent?.prepaidPercent),
  discountPercent: numberToText(agent?.discountPercent),
});

// `edit` replaces every field, so the fields this form does not show
// (customers, companies, dates) are copied from the stored agent.
export const toAgentInput = (
  values: AgentFormValues,
  stored: StoredAgent | null,
): AgentInput => ({
  number: values.number.trim(),
  status: values.status,
  customerIds: stored?.customerIds ?? [],
  companyIds: stored?.companyIds ?? [],
  startDate: stored?.startDate ?? null,
  endDate: stored?.endDate ?? null,
  hasReturn: values.hasReturn,
  returnAmount: values.hasReturn ? textToNumber(values.returnAmount) : null,
  returnPercent: values.hasReturn ? textToNumber(values.returnPercent) : null,
  prepaidPercent: values.hasReturn ? null : textToNumber(values.prepaidPercent),
  discountPercent: values.hasReturn
    ? null
    : textToNumber(values.discountPercent),
});

export const describeReward = (agent: StoredAgent) => {
  const parts = agent.hasReturn
    ? [
        agent.returnAmount && `${agent.returnAmount} back`,
        agent.returnPercent && `${agent.returnPercent}% back`,
      ]
    : [
        agent.prepaidPercent && `${agent.prepaidPercent}% prepaid`,
        agent.discountPercent && `${agent.discountPercent}% discount`,
      ];

  return parts.filter(Boolean).join(' or ');
};
