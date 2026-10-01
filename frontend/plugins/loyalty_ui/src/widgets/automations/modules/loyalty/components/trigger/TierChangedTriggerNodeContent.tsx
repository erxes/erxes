import { useTranslation } from 'react-i18next';
import {
  AutomationNodeMetaInfoRow,
  AutomationTriggerConfigProps,
} from 'ui-modules';
import { useLoyaltyAccountTypes } from '~/modules/loyalties/settings/account-type/hooks/useLoyaltyAccountTypes';
import { TTierChangedTriggerConfigForm } from '../../states/tierChangedTriggerConfigFormDefinitions';

export const TierChangedTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<TTierChangedTriggerConfigForm>) => {
  const { t } = useTranslation('loyalty');
  const { accounts } = useLoyaltyAccountTypes();
  const accountType = accounts.find(({ _id }) => _id === config?.accountTypeId);

  if (!accountType) {
    return (
      <AutomationNodeMetaInfoRow
        fieldName={t('loyalty-account-type')}
        content={t('no-account-type-selected')}
      />
    );
  }

  const tierName = config?.toTier
    ? accountType.tiers?.find(({ key }) => key === config.toTier)?.name
    : t('tier-changed-any-tier');

  return (
    <AutomationNodeMetaInfoRow
      fieldName={accountType.name}
      content={`${t(`tier-changed-direction-${config?.direction || 'up'}`)} → ${tierName}`}
    />
  );
};
