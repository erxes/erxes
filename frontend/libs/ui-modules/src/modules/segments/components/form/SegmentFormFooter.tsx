import { IconPlayerStop } from '@tabler/icons-react';
import { AlertDialog, Badge, Button, Label, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules/modules/permissions/components/PermissionGate';
import { useSegment } from '../../context/SegmentProvider';
import { useSegmentActions } from '../../hooks/useSegmentActions';
import { useSegmentRebuild } from '../../hooks/useSegmentRebuild';
import { SegmentRebuildButton } from '../SegmentRebuildButton';
import { useSegmentSaveGuard } from '../../hooks/useSegmentSaveGuard';

const FooterStat = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 shrink-0">
    <Label>{label}</Label>
    {children}
  </div>
);

const CurrentMembers = () => {
  const { segment } = useSegment();
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  if (!segment) {
    return null;
  }

  if (segment.status === 'building') {
    return (
      <FooterStat label={t('current-members')}>
        <Badge variant="secondary">{t('rebuilding')}</Badge>
      </FooterStat>
    );
  }

  if (segment.membersCount === undefined || segment.membersCount === null) {
    return null;
  }

  return (
    <FooterStat label={t('current-members')}>
      <span className="text-base font-semibold leading-none tabular-nums">
        {segment.membersCount.toLocaleString()}
      </span>
    </FooterStat>
  );
};

export const SegmentFormFooter = ({
  callback,
  onCreateSuccess,
  onOpenExisting,
}: {
  callback?: (id: string) => void;
  onCreateSuccess?: (id: string) => void;
  onOpenExisting?: (segmentId: string) => void;
}) => {
  const { form, segment } = useSegment();
  const { stats, handleCalculateStats, loading } = useSegment().stats;
  const { stop, stopping } = useSegmentRebuild(segment?._id);
  const { handleSave, saving } = useSegmentActions({
    callback,
    onCreateSuccess,
  });
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  const {
    duplicate,
    dismissDuplicate,
    openExisting,
    pendingRebuild,
    members,
    confirmRebuild,
    cancelRebuild,
    checking,
    requestSave,
  } = useSegmentSaveGuard({
    onConfirm: () => form.handleSubmit(handleSave)(),
    onOpenExisting,
  });

  return (
    <>
      <Sheet.Footer className="h-auto min-h-14 py-2 gap-4 flex-wrap border-t sm:justify-between">
        <div className="flex items-center gap-6 min-w-0">
          <CurrentMembers />
          {/* A number that was never reached is not a small number, so the
              count is replaced rather than shown alongside the reason. */}
          {stats?.exceeded ? (
            <p className="max-w-md text-sm text-muted-foreground line-clamp-2">
              {t('count-too-big')}
            </p>
          ) : (
            stats && (
              <FooterStat label={t('matching-records')}>
                <span className="text-base font-semibold leading-none tabular-nums text-primary">
                  {stats.count.toLocaleString()}
                </span>
              </FooterStat>
            )
          )}
          {!stats?.exceeded && !!stats?.unsupported?.length && (
            <p className="text-sm text-destructive line-clamp-2">
              {t('count-excludes')}: {stats.unsupported.join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Counting happens as values settle; this stays for asking again -
            after a count that gave up, or when nothing has changed. */}
          <Button
            variant="secondary"
            type="button"
            onClick={handleCalculateStats}
            disabled={loading}
          >
            {loading ? t('calculating') : t('calculate-segment-reach')}
          </Button>
          {/* Offered whatever the segment's state, not only after a failure:
            a membership can be wrong without anything having reported an
            error, and this is the only way to ask for it to be settled again
            without editing the definition into something else and back. */}
          {segment && (
            <Can action="segmentsManage">
              {/* While it runs, the useful action is stopping it - not queueing
                a second one behind the first. */}
              {segment.status === 'building' ? (
                <Button
                  variant="outline"
                  type="button"
                  className="text-destructive"
                  onClick={stop}
                  disabled={stopping || segment.buildCancelRequested}
                >
                  <IconPlayerStop />
                  {segment.buildCancelRequested
                    ? t('stopping-rebuild')
                    : t('stop-rebuild')}
                </Button>
              ) : (
                <SegmentRebuildButton segment={segment} />
              )}
            </Can>
          )}
          <Can action="segmentsManage">
            {/* Validated before the guard, so an invalid form never gets as far
              as asking about a rebuild. */}
            <Button
              type="button"
              disabled={saving || checking}
              onClick={form.handleSubmit(() => requestSave())}
            >
              {saving || checking ? t('saving') : t('save-segment')}
            </Button>
          </Can>
        </div>
      </Sheet.Footer>

      {/* No "save anyway": a button like that gets clicked without reading,
          and the duplicate it creates is paid for on every change from then
          on. The way forward is the segment that already exists. */}
      <AlertDialog
        open={!!duplicate}
        onOpenChange={(open) => !open && dismissDuplicate()}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>{t('duplicate-title')}</AlertDialog.Title>
            <AlertDialog.Description>
              {t('duplicate-description', { name: duplicate?.name })}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel onClick={dismissDuplicate}>
              {t('cancel')}
            </AlertDialog.Cancel>
            <AlertDialog.Action onClick={openExisting}>
              {t('open-existing')}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

      <AlertDialog
        open={pendingRebuild}
        onOpenChange={(open) => !open && cancelRebuild()}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>{t('rebuild-title')}</AlertDialog.Title>
            <AlertDialog.Description>
              {t('rebuild-description', { count: members })}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel onClick={cancelRebuild}>
              {t('cancel')}
            </AlertDialog.Cancel>
            <AlertDialog.Action onClick={confirmRebuild}>
              {t('save-and-rebuild')}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};
