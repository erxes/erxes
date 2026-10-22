import { createApi, type OutputOf } from 'erxes-sdk/react';
import { REACT_APP_API_URL } from 'erxes-ui';
import type * as server from '../../server';

// Refs to the server's functions: api.followUps.list, api.followUps.set.
// Typed from server/ through a type-only import, so no server code reaches
// the browser.
export const api = createApi<typeof server>({
  apiUrl: REACT_APP_API_URL,
  extId: 'deal-followups',
});

export const PER_PAGE = 20;

export type StoredFollowUp = OutputOf<
  typeof api.followUps.list
>['list'][number];

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong';

const pad = (n: number) => String(n).padStart(2, '0');

// Calendar days, not instants: the date the user picked, in their timezone.
export const toDay = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const today = () => toDay(new Date());

export const fromDay = (day: string) => {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
};

export const formatDay = (day: string) =>
  fromDay(day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

export const dealUrl = ({ dealId, pipelineId }: StoredFollowUp) =>
  `/sales/deals?${new URLSearchParams({
    ...(pipelineId && { pipelineId }),
    salesItemId: dealId,
  })}`;
