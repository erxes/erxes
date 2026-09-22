import { AiAgentApprovalTarget } from '@/automations/components/approval/AiAgentApprovalTarget';
import { AutomationApprovalTarget } from '@/automations/components/approval/AutomationApprovalTarget';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { TApprovalTargetComponent } from '@/approval/types';

const coreApprovalTargets: Record<string, TApprovalTargetComponent> = {
  [AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION]: AutomationApprovalTarget,
  [AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT]: AiAgentApprovalTarget,
};

export const isCoreApprovalTargetType = (contentType: string): boolean =>
  contentType in coreApprovalTargets;

export const getCoreApprovalTargetComponent = (
  contentType: string,
): TApprovalTargetComponent | null => coreApprovalTargets[contentType] ?? null;
