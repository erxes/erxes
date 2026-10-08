import { useTranslation } from 'react-i18next';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { getActionResultErrorText } from '@/automations/utils/automationHistoryUtils/executionResultPreview';
import { ActionResult } from 'ui-modules';

const VISIBLE_FIELD_LIMIT = 8;

const useTransformActionResult = (result?: { data?: Record<string, any> }) => {
  const entries = Object.entries(result?.data || {});

  return {
    entries: entries.slice(0, VISIBLE_FIELD_LIMIT),
    hiddenCount: Math.max(entries.length - VISIBLE_FIELD_LIMIT, 0),
    total: entries.length,
  };
};

const formatValue = (value: unknown) =>
  typeof value === 'object' && value !== null
    ? JSON.stringify(value)
    : String(value);

export const TransformActionResult = ({
  result,
}: ActionResultComponentProps<{
  data?: Record<string, any>;
  error?: unknown;
}>) => {
  const { entries, hiddenCount, total } = useTransformActionResult(result);
  const { t } = useTranslation('automations');

  if (result?.error) {
    return (
      <ActionResult.Status status="error">
        {getActionResultErrorText(result.error)}
      </ActionResult.Status>
    );
  }

  if (!total) {
    return (
      <ActionResult.Status>{t('transform-no-output')}</ActionResult.Status>
    );
  }

  return (
    <>
      <ActionResult.Status>
        {t('transform-fields-produced', { count: total })}
      </ActionResult.Status>
      <ActionResult.Fields>
        {entries.map(([key, value]) => (
          <ActionResult.Field
            key={key}
            label={key}
            value={formatValue(value)}
          />
        ))}
      </ActionResult.Fields>
      {hiddenCount ? (
        <ActionResult.Body
          title={t('transform-more-fields', { count: hiddenCount })}
        >
          <ActionResult.Json value={result?.data} />
        </ActionResult.Body>
      ) : null}
    </>
  );
};
