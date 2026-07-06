import { TApprovalTargetProps } from '@/approval/types';
import { IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router';

export const AiAgentApprovalTarget = ({
  contentId,
  label,
}: TApprovalTargetProps) => (
  <Link
    to={`/settings/automations/agents/${contentId}`}
    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
  >
    {label || 'AI Agent'}
    <IconExternalLink className="size-3.5 shrink-0" />
  </Link>
);
