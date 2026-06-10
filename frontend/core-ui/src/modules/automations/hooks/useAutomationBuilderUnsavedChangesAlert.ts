import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router';
import { TAutomationAction, TAutomationTrigger } from 'ui-modules';
import { TSplitConditionsConfigForm } from '../components/builder/nodes/actions/split/states/splitConditionsConfigForm';
import { TAutomationWaitEventConfig } from '../components/builder/nodes/actions/waitEvent/type/waitEvent';
import { IAutomation } from '../types';
import { useRemoveSegments } from '@/segments/hooks/useRemoveSegments';

const SEGMENT_AVIABLE_ACTION_TYPES = ['if', 'split', 'waitEvent'];

export const useAutomationBuilderUnsavedChangesAlert = (
  detail?: IAutomation,
) => {
  const {
    formState: { isDirty },
  } = useFormContext<TAutomationBuilderForm>();
  const { t } = useTranslation('automations');
  const isProceedingRef = useRef(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const { removeSegments } = useRemoveSegments();
  const { triggers, actions } = useAutomationNodes();

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const currentLocationPathName = currentLocation.pathname;
    const nextLocationPathName = nextLocation.pathname;

    if (
      currentLocationPathName === '/automations/create' &&
      nextLocationPathName.startsWith('/automations/edit/')
    ) {
      return false;
    }

    return isDirty && nextLocationPathName !== currentLocationPathName;
  });

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

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (blocker.state === 'unblocked') {
      isProceedingRef.current = false;
      setIsProceeding(false);
    }
  }, [blocker.state]);

  const processWithoutSaving = async () => {
    if (blocker.state !== 'blocked') {
      return;
    }

    isProceedingRef.current = true;
    setIsProceeding(true);

    try {
      await clearUnsavedSegments();
    } finally {
      blocker.proceed();
    }
  };

  return {
    blocker,
    isProceeding,
    isProceedingRef,
    t,
    processWithoutSaving,
  };
};
