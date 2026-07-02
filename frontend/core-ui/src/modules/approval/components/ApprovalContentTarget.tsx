import {
  getCoreApprovalTargetComponent,
  isCoreApprovalTargetType,
} from '@/approval/utils/coreApprovalTargets';

type Props = {
  contentType: string;
  contentId: string;
  label?: string;
};

export const ApprovalContentTarget = ({
  contentType,
  contentId,
  label,
}: Props) => {
  const CoreTarget = isCoreApprovalTargetType(contentType)
    ? getCoreApprovalTargetComponent(contentType)
    : null;

  if (CoreTarget) {
    return <CoreTarget contentId={contentId} label={label} />;
  }

  return (
    <span className="truncate text-sm font-medium">{label || contentType}</span>
  );
};
