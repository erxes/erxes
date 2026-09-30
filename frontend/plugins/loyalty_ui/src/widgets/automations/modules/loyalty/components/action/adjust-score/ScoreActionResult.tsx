import { useTranslation } from 'react-i18next';
import { ActionResult, AutomationExecutionActionResultProps } from 'ui-modules';
import { useScoreActionResult } from '../../../hooks/useScoreActionResult';

export const ScoreActionResult = ({
  action,
}: AutomationExecutionActionResultProps) => {
  const { t } = useTranslation('loyalty');
  const { isSkipped, skippedOwners, hasManyOwners, logs } =
    useScoreActionResult(action);

  if (isSkipped) {
    return (
      <ActionResult>
        <ActionResult.Status status="skipped">
          {t('score-skip-title')}
        </ActionResult.Status>
        {skippedOwners.map(({ ownerId, reasons }) => (
          <ActionResult.Body
            key={ownerId}
            title={hasManyOwners ? ownerId : t('score-skip-reasons')}
          >
            <ul className="list-disc space-y-1 pl-4">
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </ActionResult.Body>
        ))}
      </ActionResult>
    );
  }

  if (!logs.length) {
    return <ActionResult.Json value={action.result} />;
  }

  return (
    <ActionResult>
      <ActionResult.Fields>
        {logs.map((log, index) => (
          <ActionResult.Field
            key={log._id || index}
            label={logs.length > 1 ? log.ownerId || '' : t('score-change')}
            value={String(log.changeScore ?? 0)}
          />
        ))}
      </ActionResult.Fields>
    </ActionResult>
  );
};
