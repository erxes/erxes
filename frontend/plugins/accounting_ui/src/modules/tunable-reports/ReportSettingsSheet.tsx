import { Button, Sheet, Spinner } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import {
  ReportForm,
  TextSetting,
  ChoiceSetting,
} from '@/tunable-reports/fields';
import { useReportTranslation } from '@/tunable-reports/locales';
import { ReportTransferField } from '@/tunable-reports/ReportTransferField';

export const ReportSettingsSheet = ({
  form,
  open,
  onOpenChange,
  onSave,
  onRemove,
  canEdit,
  busy,
  reportId,
}: {
  form: ReportForm;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<void>;
  onRemove?: () => Promise<void>;
  canEdit: boolean;
  busy: boolean;
  reportId?: string;
}) => {
  const { t } = useReportTranslation();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="sm:max-w-lg bg-background">
        <Sheet.Header>
          <Sheet.Title>{t('reportSettings')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto p-4">
          <fieldset disabled={!canEdit || busy} className="space-y-4 min-w-0">
            <TextSetting
              form={form}
              name="description"
              label={t('description')}
            />
            <ChoiceSetting
              form={form}
              name="orientation"
              label={t('orientation')}
              options={['portrait', 'landscape'].map((value) => ({
                value,
                label: t(value),
              }))}
            />
            <ChoiceSetting
              form={form}
              name="status"
              label={t('status')}
              options={['active', 'archived'].map((value) => ({
                value,
                label: t(value),
              }))}
            />
          </fieldset>
          <div className="mt-6 border-t pt-4">
            <ReportTransferField
              form={form}
              currentReportId={reportId}
              canApply={canEdit && !busy}
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void onRemove()}
            >
              <IconTrash />
              {t('remove')}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {t('done')}
          </Button>
          {canEdit && (
            <Button type="button" disabled={busy} onClick={() => void onSave()}>
              {busy && <Spinner />}
              {t('save')}
            </Button>
          )}
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
