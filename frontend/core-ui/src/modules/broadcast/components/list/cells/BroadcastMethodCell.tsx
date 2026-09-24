import { Badge, RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { broadcastMethodDisplay } from '../../../utils/broadcastMethod';

export const BroadcastMethodCell = ({ method }: { method?: string }) => {
  const { t } = useTranslation('broadcasts');
  const { Icon, labelKey } = broadcastMethodDisplay(method);

  return (
    <RecordTableInlineCell>
      <Badge variant="secondary">
        <Icon className="w-4 h-4" />
        <span>{t(labelKey)}</span>
      </Badge>
    </RecordTableInlineCell>
  );
};
