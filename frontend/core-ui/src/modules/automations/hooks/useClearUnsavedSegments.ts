import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useRemoveSegments } from '@/segments/hooks/useRemoveSegments';
import { useCallback } from 'react';
import { TAutomationAction, TAutomationTrigger } from 'ui-modules';
import { TSplitConditionsConfigForm } from '../components/builder/nodes/actions/split/states/splitConditionsConfigForm';
import { TAutomationWaitEventConfig } from '../components/builder/nodes/actions/waitEvent/type/waitEvent';
import { useAutomation } from '../context/AutomationProvider';

const SEGMENT_AVIABLE_ACTION_TYPES = ['if', 'split', 'waitEvent'];

// Segments created by edits that were never saved; dropping the edits orphans them.
export const useClearUnsavedSegments = () => {
  const { detail } = useAutomation();
  const { removeSegments } = useRemoveSegments();
  const { triggers, actions } = useAutomationNodes();

  const getSegmentIdsFromNodes = useCallback(
    ({
      triggers = [],
      actions = [],
    }: {
      triggers: TAutomationTrigger[];
      actions: TAutomationAction[];
    }) => {
      const triggerSegmentIds = triggers
        .filter((trigger) => !trigger?.isCustom)
        .map((trigger) => trigger?.config?.contentId)
        .filter(Boolean);

      const actionSegmentIds = actions.flatMap((action) => {
        if (!SEGMENT_AVIABLE_ACTION_TYPES.includes(action.type)) {
          return [];
        }

        if (action.type === 'if') {
          return action?.config?.contentId ? [action.config.contentId] : [];
        }

        if (action.type === 'split') {
          const { config } =
            action as TAutomationAction<TSplitConditionsConfigForm>;

          return (config?.options || [])
            .map((option) => option.segmentId)
            .filter(Boolean);
        }

        if (action.type === 'waitEvent') {
          const { config } =
            action as TAutomationAction<TAutomationWaitEventConfig>;

          return config?.segmentId ? [config.segmentId] : [];
        }

        return [];
      });

      return Array.from(new Set([...triggerSegmentIds, ...actionSegmentIds]));
    },
    [],
  );

  const clearUnsavedSegments = useCallback(async () => {
    const unsavedSegmentIds = getSegmentIdsFromNodes({ triggers, actions });
    const savedSegmentIds = detail
      ? getSegmentIdsFromNodes({
          triggers: detail.triggers,
          actions: detail.actions,
        })
      : [];

    const segmentIdsToClear = unsavedSegmentIds.filter(
      (id) => !savedSegmentIds.includes(id),
    );

    if (!segmentIdsToClear.length) {
      return;
    }

    await removeSegments(segmentIdsToClear);
  }, [detail, getSegmentIdsFromNodes, removeSegments, triggers, actions]);

  return { clearUnsavedSegments };
};
