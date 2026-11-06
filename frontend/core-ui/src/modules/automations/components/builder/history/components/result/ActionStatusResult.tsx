import {
  ActionResultShapeView,
  isReadableResultShape,
} from '@/automations/components/builder/history/components/result/ActionResultShapeView';
import { readActionResultShape } from '@/automations/utils/automationHistoryUtils/actionResultShape';
import { EXECUTION_STATUS_LABEL_KEYS } from '@/automations/utils/automationHistoryUtils/executionFormat';
import { TActionStatusView } from '@/automations/utils/automationHistoryUtils/executionResultPreview';
import { useTranslation } from 'react-i18next';
import { ActionResult } from 'ui-modules';

/** Every outcome but success, drawn the same way whatever the action. */
export const ActionStatusResult = ({ view }: { view: TActionStatusView }) => {
  const { t } = useTranslation('automations');
  const label = t(EXECUTION_STATUS_LABEL_KEYS[view.status]);
  const details = readActionResultShape(view.details);

  return (
    <>
      <ActionResult.Status status={view.status}>
        <span className="whitespace-pre-wrap">
          {view.status === 'error' || !view.message
            ? view.message || label
            : `${label} · ${view.message}`}
        </span>
      </ActionResult.Status>
      {view.code && (
        <ActionResult.Fields>
          <ActionResult.Field
            label={t('history-error-code')}
            value={view.code}
          />
        </ActionResult.Fields>
      )}
      {isReadableResultShape(details) && (
        <section className="min-w-0 space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground">
            {view.status === 'error'
              ? t('history-failure-details')
              : t('history-result-details')}
          </h4>
          <ActionResultShapeView shape={details} />
        </section>
      )}
    </>
  );
};
