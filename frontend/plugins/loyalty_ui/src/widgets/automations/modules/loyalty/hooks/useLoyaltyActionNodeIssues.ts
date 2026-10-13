import { useReportNodeIssues } from 'ui-modules';
import { ZodTypeAny } from 'zod';
import { adjustScoreActionConfigFormSchema } from '../states/adjustScoreActionConfigFormDefinitions';
import {
  awardSpinActionConfigFormSchema,
  issueVoucherActionConfigFormSchema,
} from '../states/campaignActionConfigFormDefinitions';
import { setTierActionConfigFormSchema } from '../states/setTierActionConfigFormDefinitions';
import {
  isAdjustScoreActionType,
  isAwardSpinActionType,
  isIssueVoucherActionType,
  isSetTierActionType,
} from '../utils/loyaltyActionUtils';

const schemaFor = (type?: string): ZodTypeAny | undefined => {
  if (isSetTierActionType(type)) {
    return setTierActionConfigFormSchema;
  }

  if (isAdjustScoreActionType(type)) {
    return adjustScoreActionConfigFormSchema;
  }

  if (isIssueVoucherActionType(type)) {
    return issueVoucherActionConfigFormSchema;
  }

  if (isAwardSpinActionType(type)) {
    return awardSpinActionConfigFormSchema;
  }

  return undefined;
};

/** Whatever the action's own form would refuse is what the node still needs. */
export const useLoyaltyActionNodeIssues = (type?: string, config?: unknown) => {
  const result = schemaFor(type)?.safeParse(config || {});

  useReportNodeIssues(
    result && !result.success
      ? [...new Set(result.error.issues.map(({ message }) => message))]
      : [],
  );
};
