import { IAutomation } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BROADCAST_RUNS } from '../graphql/queries';
import { TBroadcastRecipient, TBroadcastRun } from '../types';
import { useBroadcastRecipients } from './useBroadcastRecipients';

/**
 * One campaign's manifest, the run it belongs to, and the row opened under it.
 *
 * A campaign can have run more than once, so a recipient list is only ever a
 * list *within a run* — picking the run comes first, and everything below it
 * follows from that choice. Keeping the three in one place is what stops the
 * panel showing run 2's people with run 1's counts.
 *
 * @param automation only a workflow campaign has one. The form it seeds is
 * what the flow nodes read their configuration out of, and it is seeded once,
 * so this must not be called before the automation has loaded.
 */
export const useBroadcastRunRecipients = (
  messageId?: string,
  automation?: IAutomation,
) => {
  const [runId, setRunId] = useState<string>('');
  const [selected, setSelected] = useState<TBroadcastRecipient | null>(null);

  const form = useForm<TAutomationBuilderForm>({
    defaultValues: {
      ...(automation || {}),
      triggers: automation?.triggers || [],
      actions: automation?.actions || [],
    } as TAutomationBuilderForm,
  });

  const { data, loading: runsLoading } = useQuery(BROADCAST_RUNS, {
    variables: { engageMessageId: messageId },
    skip: !messageId,
  });

  const runs: TBroadcastRun[] = data?.engageBroadcastRuns ?? [];
  // The newest run is what someone opening this wants, until they pick another.
  const selectedRun = runs.find((run) => run._id === runId) ?? runs[0];

  const recipients = useBroadcastRecipients(selectedRun?._id);

  return {
    form,
    runs,
    runsLoading,
    selectedRun,
    setRunId,
    selected,
    setSelected,
    // Only a dispatched recipient has a flow to look into.
    executionId: selected?.execution?._id,
    ...recipients,
  };
};
