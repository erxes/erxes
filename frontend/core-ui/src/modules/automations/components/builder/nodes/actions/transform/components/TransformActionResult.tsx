import { useTranslation } from 'react-i18next';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { ActionResult } from 'ui-modules';
import {
  formatValue,
  useTransformActionResult,
} from '@/automations/components/builder/nodes/actions/transform/hooks/useTransformActionResult';

export const TransformActionResult = ({
  result,
}: ActionResultComponentProps<{
  data?: Record<string, unknown>;
}>) => {
  const { entries, hiddenCount, total } = useTransformActionResult(result);
  const { t } = useTranslation('automations');

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
