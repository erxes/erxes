import { IconAlertTriangle } from '@tabler/icons-react';
import { AlertDialog, Button, Spinner } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useFieldUsage, usePropertyArchive } from '../hooks/usePropertyArchive';
import { archiveTargetState } from '../states/archiveTargetState';

export const PropertyArchiveDialog = ({
  contentType,
}: {
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [target, setTarget] = useAtom(archiveTargetState);
  const { usage, loading: checking } = useFieldUsage(target, contentType);
  const { archive, remove, loading } = usePropertyArchive();
  const close = () => setTarget(null);

  const removable = !checking && !!usage?.removable;
  const dependents = usage?.dependents ?? [];

  const description = checking
    ? t('remove-checking', 'Checking whether anything uses it…')
    : target?.archived && !removable
      ? t(
          'remove-archived-in-use',
          'Records still hold values or rules depend on it, so it stays in Archived.',
        )
      : removable
        ? t(
            'remove-unused',
            'Nothing uses it and no record holds a value, so it can be deleted.',
          )
        : usage?.hasValues
          ? t(
              'remove-has-values',
              'Records hold values, so it can only be archived — the values stay and it can be restored any time.',
            )
          : usage?.hasValues === null
            ? t(
                'remove-unknown',
                'Could not confirm that no record holds a value, so it can only be archived.',
              )
            : t(
                'remove-has-dependents',
                'Other rules depend on it, so it can only be archived.',
              );

  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && close()}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>
            {target?.archived
              ? t('delete-title', 'Delete {{label}}?', { label: target.label })
              : checking || removable
                ? t('remove-title', 'Remove {{label}}?', {
                    label: target?.label,
                  })
                : t('archive-title', 'Archive {{label}}?', {
                    label: target?.label,
                  })}
          </AlertDialog.Title>
          <AlertDialog.Description className="flex items-center gap-2">
            {checking && <Spinner size="sm" containerClassName="w-auto" />}
            {description}
          </AlertDialog.Description>
        </AlertDialog.Header>

        {dependents.length > 0 && (
          <div className="flex gap-2 rounded-md bg-warning/10 p-3 text-sm">
            <IconAlertTriangle className="size-4 shrink-0 text-warning" />
            <div>
              <p className="font-medium">
                {t('archive-used-in-logic', 'Used in logic by')}{' '}
                {dependents.join(', ')}
              </p>
              <p className="text-muted-foreground">
                {t(
                  'archive-logic-hint',
                  'Those rules stop matching until it is restored.',
                )}
              </p>
            </div>
          </div>
        )}

        <AlertDialog.Footer>
          <AlertDialog.Cancel>{t('cancel', 'Cancel')}</AlertDialog.Cancel>
          {/* Delete is offered only once the check proves nothing uses it. */}
          {!target?.archived && (
            <Button
              variant={removable ? 'secondary' : 'default'}
              disabled={loading || !target}
              onClick={() => target && archive(target, close)}
            >
              {t('archive', 'Archive')}
            </Button>
          )}
          {removable && (
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => target && remove(target, close)}
            >
              {t('delete', 'Delete')}
            </Button>
          )}
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
