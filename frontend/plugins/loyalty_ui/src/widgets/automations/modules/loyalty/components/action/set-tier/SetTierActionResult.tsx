import { useTranslation } from 'react-i18next';
import { ActionResult, AutomationExecutionActionResultProps } from 'ui-modules';
import { useSetTierActionResult } from '../../../hooks/useSetTierActionResult';

export const SetTierActionResult = ({
  action,
}: AutomationExecutionActionResultProps) => {
  const { t } = useTranslation('loyalty');
  const { owners, hasManyOwners, isUnchanged } = useSetTierActionResult(action);

  if (!owners.length) {
    return <ActionResult.Json value={action.result} />;
  }

  if (isUnchanged) {
    return (
      <ActionResult>
        <ActionResult.Status status="skipped">
          {t('set-tier-result-unchanged', { tier: owners[0].to })}
        </ActionResult.Status>
      </ActionResult>
    );
  }

  return (
    <ActionResult>
      <ActionResult.Fields>
        {owners.map(({ ownerId, from, to }) => (
          <ActionResult.Field
            key={ownerId}
            label={hasManyOwners ? ownerId : t('set-tier-result-tier')}
            value={`${from} → ${to}`}
          />
        ))}
      </ActionResult.Fields>
    </ActionResult>
  );
};
