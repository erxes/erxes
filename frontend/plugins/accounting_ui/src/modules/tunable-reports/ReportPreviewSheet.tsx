import { Button, Sheet, cn } from 'erxes-ui';
import { ReportForm } from '@/tunable-reports/fields';
import { ReportPaper } from '@/tunable-reports/ReportPreview';
import { useReportTranslation } from '@/tunable-reports/locales';
import { useReportOrganization } from '@/tunable-reports/useReportOrganization';

export const ReportPreviewSheet = ({
  form,
  open,
  onOpenChange,
}: {
  form: ReportForm;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useReportTranslation();
  const values = form.watch();
  const { organization } = useReportOrganization();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View
        className={cn(
          'bg-background',
          values.orientation === 'landscape' ? 'sm:max-w-7xl' : 'sm:max-w-5xl',
        )}
      >
        <Sheet.Header className="h-auto py-2">
          <div className="min-w-0">
            <Sheet.Title>{t('preview')}</Sheet.Title>
            <Sheet.Description>{t('previewHint')}</Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto bg-muted">
          <ReportPaper values={values} organization={organization} />
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('done')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
