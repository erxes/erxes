import { IconDeviceDesktop, IconLogout } from '@tabler/icons-react';
import {
  Badge,
  Button,
  RelativeDateDisplay,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import {
  useMemberSessions,
  useRevokeMemberSessions,
} from '@/settings/team-member/sessions/hooks/useMemberSessions';
import { describeUserAgent } from '@/settings/team-member/sessions/describeUserAgent';
import { IUserSession } from '@/settings/team-member/sessions/types';

const toIso = (value: string) => new Date(value).toISOString();

const SessionRow = ({
  session,
  onSignOut,
  disabled,
}: {
  session: IUserSession;
  onSignOut: () => void;
  disabled: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <li className="flex items-start gap-3 rounded-lg border p-4">
      <IconDeviceDesktop className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            {describeUserAgent(session.userAgent) || t('unknown-device')}
          </span>
          {session.current && <Badge>{t('this-device')}</Badge>}
          <Badge variant="secondary">
            {t(`session-method-${session.method}`)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            {t('signed-in')}{' '}
            <RelativeDateDisplay value={toIso(session.createdAt)}>
              <RelativeDateDisplay.Value value={toIso(session.createdAt)} />
            </RelativeDateDisplay>
          </span>
          <span>
            {t('last-active')}{' '}
            <RelativeDateDisplay value={toIso(session.lastSeenAt)}>
              <RelativeDateDisplay.Value value={toIso(session.lastSeenAt)} />
            </RelativeDateDisplay>
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={onSignOut}
      >
        <IconLogout /> {t('sign-out')}
      </Button>
    </li>
  );
};

export const MemberSessions = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { confirm } = useConfirm();
  const { userDetail } = useUserDetail();
  const userId = userDetail?._id || '';
  const { sessions, loading, error } = useMemberSessions(userId);
  const { revoke, loading: revoking } = useRevokeMemberSessions();

  const signOut = (sessionId?: string) =>
    confirm({
      message: t(
        sessionId ? 'confirm-sign-out-session' : 'confirm-sign-out-everywhere',
      ),
    }).then(() => revoke(userId, sessionId));

  return (
    <section className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">{t('active-sessions')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('active-sessions-description')}
          </p>
        </div>
        <Button
          variant="destructive"
          disabled={revoking || !sessions.length}
          onClick={() => signOut()}
        >
          <IconLogout /> {t('sign-out-everywhere')}
        </Button>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      {!loading && !error && !sessions.length && (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t('no-active-sessions')}
        </p>
      )}

      {!!sessions.length && (
        <ul className="flex flex-col gap-2">
          {sessions.map((session) => (
            <SessionRow
              key={session._id}
              session={session}
              disabled={revoking}
              onSignOut={() => signOut(session._id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
};
