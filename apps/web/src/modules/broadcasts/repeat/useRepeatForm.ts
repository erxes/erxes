import type { BroadcastSchedule } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSession } from '~/modules/auth/session';
import { defaultDraft, draftOf, isRuleComplete, type RepeatDraft, ruleOf } from './repeatDraft';

/** Run times the dialog previews. */
const PREVIEW_COUNT = 5;

/**
 * The repeat fields, from the saved schedule or the defaults, and the next runs they give on the
 * organisation's clock (asked of the API, which computes the runs themselves).
 */
export const useRepeatForm = (schedule: BroadcastSchedule | null) => {
  const { timezone } = useSession().organization;

  const [draft, setDraft] = useState(() =>
    schedule ? draftOf(schedule, timezone) : defaultDraft(timezone),
  );

  const complete = isRuleComplete(draft);
  const rule = ruleOf(draft);

  const preview = useQuery(
    orpc.broadcastSchedules.preview.queryOptions({
      input: { ...rule, count: PREVIEW_COUNT },
      enabled: complete,
      placeholderData: keepPreviousData,
      retry: false,
    }),
  );

  return {
    draft,
    rule,
    complete,
    preview,
    change: (patch: Partial<RepeatDraft>) => setDraft((current) => ({ ...current, ...patch })),
  };
};

export type RepeatForm = ReturnType<typeof useRepeatForm>;
