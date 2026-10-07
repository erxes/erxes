import { IconAlertTriangle } from '@tabler/icons-react';
import { AlertDialog, Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useOptionDependents } from '../hooks/useOptionDependents';

export interface IArchivingOption {
  label: string;
  value: string;
  // Records holding it; null when they could not be counted.
  held: number | null;
}

// Archiving blocks new picks but keeps history, so the org is told what still
// relies on the option before it decides.
export const PropertyOptionArchiveDialog = ({
  fieldId,
  option,
  onConfirm,
  onClose,
}: {
  fieldId?: string;
  option: IArchivingOption | null;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { dependents, loading } = useOptionDependents(fieldId, option?.value);

  const logics = dependents?.logics ?? [];
  const segments = dependents?.segments ?? [];

  return (
    <AlertDialog open={!!option} onOpenChange={(open) => !open && onClose()}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>
            {t('archive-option-title', 'Archive "{{label}}"?', {
              label: option?.label,
            })}
          </AlertDialog.Title>
          <AlertDialog.Description>
            {option?.held
              ? t(
                  'archive-option-held',
                  "It can't be picked anymore. {{count}} records keep it and show it as Archived.",
                  { count: option.held },
                )
              : t(
                  'archive-option-unknown',
                  "It can't be picked anymore. Records that already hold it keep it and show it as Archived.",
                )}
          </AlertDialog.Description>
        </AlertDialog.Header>

        <div className="flex gap-2 rounded-md bg-warning/10 p-3 text-sm">
          <IconAlertTriangle className="size-4 shrink-0 text-warning" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              {t('archive-option-relies', 'Settings that may still rely on it')}
            </p>
            {loading && <Spinner size="sm" containerClassName="w-auto" />}
            {logics.length > 0 && (
              <p>
                {t('archive-option-logics', 'Logic in {{names}}', {
                  names: logics.join(', '),
                })}
              </p>
            )}
            {segments.length > 0 && (
              <p>
                {t('archive-option-segments', 'Segments: {{names}}', {
                  names: segments.join(', '),
                })}
              </p>
            )}
            <p className="text-muted-foreground">
              {t(
                'archive-option-check',
                'Also check automations, broadcasts and external forms that use this property.',
              )}
            </p>
          </div>
        </div>

        <AlertDialog.Footer>
          <AlertDialog.Cancel>{t('cancel', 'Cancel')}</AlertDialog.Cancel>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {t('archive', 'Archive')}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
