import { TApprovalTargetProps } from '@/approval/types';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router';

export const AiAgentApprovalTarget = ({
  contentId,
  label,
}: TApprovalTargetProps) => (
  <Link
    to={`${AutomationSettingsPath.Agents}/${contentId}`}
    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
  >
    {label || 'AI Agent'}
    <IconExternalLink className="size-3.5 shrink-0" />
  </Link>
);
