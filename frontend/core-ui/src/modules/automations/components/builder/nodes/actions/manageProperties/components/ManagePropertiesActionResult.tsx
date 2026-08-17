import { stringifyAutomationHistoryValue } from '@/automations/components/builder/history/components/AutomationHistoryPopoverValue';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { getManagePropertiesSummary } from '@/automations/components/builder/nodes/actions/manageProperties/utils/managePropertiesResultPreview';
import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActionResult } from 'ui-modules';

type TPropertyChange = {
  field: string;
  fieldLabel?: string;
  status?: 'updated' | 'failed' | 'skipped';
  value?: unknown;
  placeholder?: string;
};

type TManagePropertiesResult = {
  target?: { count?: number; label?: string };
  module?: string;
  changes?: TPropertyChange[];
  summary?: string;
  result?: { error?: string }[];
  fields?: string;
};

const CHANGE_STATUS_CLASS: Record<string, string> = {
  failed: 'text-destructive',
  skipped: 'text-muted-foreground',
  updated: 'text-success',
};

export const ManagePropertiesActionResult = ({
  result,
}: ActionResultComponentProps<TManagePropertiesResult>) => {
  const { t } = useTranslation('automations');

  if (!Array.isArray(result?.changes)) {
    return (
      <ActionResult.Status>
        {getManagePropertiesSummary(result)}
      </ActionResult.Status>
    );
  }

  const target = result.target || {};

  return (
    <>
      <ActionResult.Status>
        {t('set-property-updated-target', {
          count: target.count ?? result.changes.length,
          target: target.label || result.module || t('property-type'),
        })}
      </ActionResult.Status>

      <div className="divide-y divide-border rounded-md border">
        {result.changes.map((change, index) => (
          <div key={`${change.field}-${index}`} className="space-y-1 p-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium">
                {change.fieldLabel || change.field}
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  CHANGE_STATUS_CLASS[change.status || 'updated'],
                )}
              >
                {t(`set-property-status-${change.status || 'updated'}`)}
              </span>
            </div>
            <ActionResult.Fields>
              <ActionResult.Field
                label={t('value')}
                value={
                  stringifyAutomationHistoryValue(change.value) ||
                  t('set-property-empty-value')
                }
              />
              <ActionResult.Field
                label={t('set-property-from')}
                value={change.placeholder}
              />
            </ActionResult.Fields>
          </div>
        ))}
      </div>
    </>
  );
};
