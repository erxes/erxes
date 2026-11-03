import { Avatar, readImage, RelativeDateDisplay } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { TeamMembersPath } from '@/settings/team-member/constants/teamMemberRoutes';
import { IUserActivityRankItem } from '../types';
import { formatActiveMinutes } from '../utils/formatActiveMinutes';

const displayName = ({ user }: IUserActivityRankItem) =>
  user.details?.fullName ||
  [user.details?.firstName, user.details?.lastName].filter(Boolean).join(' ') ||
  user.email ||
  '-';

export const ActivityRankRow = ({
  item,
  rank,
  maxMinutes,
}: {
  item: IUserActivityRankItem;
  rank?: number;
  maxMinutes?: number;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const navigate = useNavigate();
  const name = displayName(item);
  const lastActiveAt = item.lastActiveAt
    ? new Date(item.lastActiveAt).toISOString()
    : '';

  const openDetail = () =>
    navigate(
      `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}?user_id=${item.user._id}&tab=active-time`,
    );

  return (
    <li>
      <button
        type="button"
        onClick={openDetail}
        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
      >
        {rank !== undefined && (
          <span className="w-5 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
            {rank}
          </span>
        )}
        <Avatar size="lg">
          <Avatar.Image src={readImage(item.user.details?.avatar || '', 200)} />
          <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate font-medium">{name}</span>
          {maxMinutes ? (
            <div className="h-1.5 w-full rounded-full bg-accent">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.activeMinutes / maxMinutes) * 100}%` }}
              />
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              {lastActiveAt ? (
                <>
                  {t('last-active')}{' '}
                  <RelativeDateDisplay value={lastActiveAt}>
                    <RelativeDateDisplay.Value value={lastActiveAt} />
                  </RelativeDateDisplay>
                </>
              ) : (
                t('never-active')
              )}
            </span>
          )}
        </div>
        {maxMinutes !== undefined && (
          <span className="shrink-0 tabular-nums">
            {formatActiveMinutes(t, item.activeMinutes)}
          </span>
        )}
      </button>
    </li>
  );
};
