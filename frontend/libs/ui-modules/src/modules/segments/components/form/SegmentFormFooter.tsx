import { AlertDialog, Badge, Button, Label, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules/modules/permissions/components/PermissionGate';
import { useSegment } from '../../context/SegmentProvider';
import { useSegmentActions } from '../../hooks/useSegmentActions';
import { useSegmentSaveGuard } from '../../hooks/useSegmentSaveGuard';
import { useSegmentStats } from '../../hooks/useSegmentStats';

/**
 * Two numbers live here and they answer different questions: what the segment
 * holds right now, and what its current definition would match. They differ
 * while a rebuild is queued or running, which is exactly when it matters to
 * see both.
 */
const CurrentMembers = () => {
  const { segment } = useSegment();
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  if (!segment) {
    return null;
  }

  if (segment.status === 'building') {
    return (
      <div className="flex flex-col items-center">
        <Label>{t('current-members')}</Label>
        <Badge variant="secondary">{t('rebuilding')}</Badge>
      </div>
    );
  }

  // Never counted is not zero members, so it says nothing rather than "0".
  if (segment.membersCount === undefined || segment.membersCount === null) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <Label>{t('current-members')}</Label>
      <h4 className="text-xl">{segment.membersCount.toLocaleString()}</h4>
    </div>
  );
};

export const SegmentFormFooter = ({
  callback,
  onCreateSuccess,
  onOpenExisting,
}: {
  callback?: (id: string) => void;
  onCreateSuccess?: (id: string) => void;
  /** Opens the segment that already asks what this form is asking. */
  onOpenExisting?: (segmentId: string) => void;
}) => {
  const { form, segment } = useSegment();
  const { stats, handleCalculateStats, loading } = useSegmentStats();
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
      <Sheet.Footer className="gap-6 sm:justify-start border-y-2 px-6 py-4">
        <CurrentMembers />
        {stats && (
          <div className="flex flex-col items-center">
            <Label>{t('matching-records')}</Label>
            <h4 className="text-xl text-primary">
              {stats.count.toLocaleString()}
            </h4>
          </div>
        )}
        {/* A partial count is worse than none if it looks complete. */}
        {!!stats?.unsupported?.length && (
          <p className="text-sm text-destructive self-center">
            {t('count-excludes')}: {stats.unsupported.join(', ')}
          </p>
        )}
      </Sheet.Footer>
      <Sheet.Footer className="px-2">
        <Button
          variant="secondary"
          type="button"
          onClick={handleCalculateStats}
          disabled={loading}
        >
          {loading ? t('calculating') : t('calculate-segment-reach')}
        </Button>
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
