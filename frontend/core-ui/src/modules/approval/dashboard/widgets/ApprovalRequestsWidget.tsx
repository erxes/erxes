import {
  APPROVAL_REQUESTS_DEFAULT_CONFIG,
  approvalRequestsConfigSchema,
} from '@/approval/dashboard/approvalDashboardConfig';
import { useApprovalDashboardRequests } from '@/approval/dashboard/hooks/useApprovalDashboardRequests';
import { TDashboardWidgetProps } from '@/home/dashboard/types/dashboardTypes';
import {
  APPROVAL_REQUEST_STATUS_META,
  getApprovalRequestUserName,
} from '@/settings/approval/components/approvalRequestUtils';
import { AppPath } from '@/types/paths/AppPath';
import { SettingsWorkspacePath } from '@/types/paths/SettingsPath';
import { Badge, Button, RelativeDateDisplay } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ApprovalRequest,
  DashboardWidgetCard,
  DashboardWidgetEmptyState,
  DashboardWidgetListSkeleton,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';

const ApprovalRequestRow = ({
  request,
  isDecided,
}: {
  request: ApprovalRequest;
  isDecided: boolean;
}) => {
  const { t } = useTranslation('approval');
  const { openRecord } = useSidePanel();
  const { t: tHome } = useTranslation('common', { keyPrefix: 'home.widgets' });
  const { icon: StatusIcon, variant } =
    APPROVAL_REQUEST_STATUS_META[request.status];

  return (
    <button
      type="button"
      onClick={() =>
        openRecord({
          contentType: 'core:approvalRequest',
          contentId: request._id,
        })
      }
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-accent"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {request.content?.label || request.contentType}
        </div>
        <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate">
            {getApprovalRequestUserName(request.requester)}
          </span>
          <span>·</span>
          <span className="shrink-0">
            <RelativeDateDisplay.Value value={request.createdAt} />
          </span>
        </div>
      </div>
      {isDecided ? (
        <Badge variant="secondary" className="shrink-0">
          {tHome('approvals-decided')}
        </Badge>
      ) : (
        <Badge variant={variant} className="shrink-0">
          <StatusIcon className="size-3.5" />
          {t(`status-${request.status}`)}
        </Badge>
      )}
    </button>
  );
};

/** Approval requests waiting on me, or the ones I sent. */
export const ApprovalRequestsWidget = ({ config }: TDashboardWidgetProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'home.widgets' });
  const { isLoaded, hasModulePermission } = usePermissionCheck();
  const parsed = approvalRequestsConfigSchema.safeParse(config);
  const { scope } = parsed.success
    ? parsed.data
    : APPROVAL_REQUESTS_DEFAULT_CONFIG;
  const { list, loading, error, userId } = useApprovalDashboardRequests({
    scope,
  });

  // Approvers act from here even without the settings page
  const canOpenSettings = isLoaded && hasModulePermission('approval');

  const renderContent = () => {
    if (loading && !list.length) {
      return <DashboardWidgetListSkeleton />;
    }

    if (error) {
      return (
        <DashboardWidgetEmptyState>
          {t('approvals-error')}
        </DashboardWidgetEmptyState>
      );
    }

    if (!list.length) {
      return (
        <DashboardWidgetEmptyState>
          {t(`approvals-empty-${scope}`)}
        </DashboardWidgetEmptyState>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        {list.map((request) => (
          <ApprovalRequestRow
            key={request._id}
            request={request}
            isDecided={
              scope === 'toDecide' &&
              request.decisions.some((decision) => decision.userId === userId)
            }
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardWidgetCard
      title={t(`approvals-title-${scope}`)}
      action={
        canOpenSettings && (
          <Button asChild size="sm" variant="ghost">
            <Link
              to={`/${AppPath.Settings}/${SettingsWorkspacePath.ApprovalRequests}`}
            >
              {t('approvals-view-all')}
            </Link>
          </Button>
        )
      }
    >
      {renderContent()}
    </DashboardWidgetCard>
  );
};
