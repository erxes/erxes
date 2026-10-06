import { useAutomation } from '@/automations/context/AutomationProvider';
import { NodeData } from '@/automations/types';
import { isSegmentMembershipTrigger } from '@/automations/utils/automationBuilderUtils/triggerFolks';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useFormContext, useWatch } from 'react-hook-form';

// The rule that re-runs on every event rather than on a field change.
export const RE_ENROLL_EVERY_TIME = '*';

type TReEnrollmentConfig = {
  reEnrollment?: boolean;
  reEnrollmentRules?: string[];
  once?: boolean;
};

/**
 * One re-enrollment setting for every trigger: `reEnrollmentRules` holds the
 * fields whose change re-runs it, or "every time" where the trigger offers it.
 * Segment membership runs every time unless told otherwise, and used to be
 * told with `once`.
 */
export const useTriggerReEnrollment = (activeNode: NodeData) => {
  const { control, setValue } = useFormContext<TAutomationBuilderForm>();
  const { triggersConst } = useAutomation();
  const path: `triggers.${number}.config` = `triggers.${activeNode.nodeIndex}.config`;
  const config = (useWatch({ control, name: path }) ||
    {}) as TReEnrollmentConfig & Record<string, unknown>;

  const constant = triggersConst.find(({ type }) => type === activeNode.type);
  const membership = isSegmentMembershipTrigger(config);
  const rules = config.reEnrollmentRules || [];
  const fieldRules = rules.filter((rule) => rule !== RE_ENROLL_EVERY_TIME);

  const everyTime =
    membership && config.reEnrollment === undefined
      ? !config.once
      : !!config.reEnrollment && rules.includes(RE_ENROLL_EVERY_TIME);

  const save = (nextRules: string[]) => {
    // `once` is replaced by the rules from here on.
    const rest = { ...config };
    delete rest.once;

    setValue(
      path,
      {
        ...rest,
        reEnrollment: nextRules.length > 0,
        reEnrollmentRules: nextRules,
      },
      { shouldDirty: true },
    );
  };

  return {
    // Every event already re-runs it; nothing to choose.
    alwaysRuns: !!constant?.reEnrollment,
    everyTimeOffered: membership || !!constant?.reEnrollable,
    everyTime,
    setEveryTime: (on: boolean) => save(on ? [RE_ENROLL_EVERY_TIME] : []),
    fieldRules,
    toggleField: (field: string, on: boolean) =>
      save(
        on
          ? [...new Set([...fieldRules, field])]
          : fieldRules.filter((rule) => rule !== field),
      ),
  };
};
