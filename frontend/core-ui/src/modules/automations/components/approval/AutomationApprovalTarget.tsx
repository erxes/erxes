import { TApprovalTargetProps } from '@/approval/types';
import { IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router';

export const AutomationApprovalTarget = ({
  contentId,
  label,
}: TApprovalTargetProps) => (
  <Link
    to={`/automations/edit/${contentId}`}
    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
  >
    {label || 'Automation'}
    <IconExternalLink className="size-3.5 shrink-0" />
  </Link>
);
