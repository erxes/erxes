import { Badge, RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TCampaignSchedule } from '../../../utils/campaignSchedule';
import { campaignTrigger } from '../../../utils/broadcastTrigger';

export const BroadcastTriggerCell = ({
  row,
}: {
  row: TCampaignSchedule & { kind?: string };
}) => {
  const { t } = useTranslation('broadcasts');
  const { Icon, labelKey } = campaignTrigger(row);

  return (
    <RecordTableInlineCell>
      <Badge variant="secondary">
        <Icon className="w-4 h-4" />
        <span>{t(labelKey)}</span>
      </Badge>
    </RecordTableInlineCell>
  );
};
