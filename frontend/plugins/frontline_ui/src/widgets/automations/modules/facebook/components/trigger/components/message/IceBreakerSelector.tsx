import { useFacebookBot } from '@/integrations/facebook/hooks/useFacebookBots';
import { IconSnowflake } from '@tabler/icons-react';
import { Checkbox, Spinner, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFacebookBotTriggerClaims } from '../../hooks/useFacebookBotTriggerClaims';
import { TriggerClaimNote } from './TriggerClaimNote';

export const IceBreakerSelector = ({
  botId,
  currentTriggerId,
  selectedIceBreakerIds = [],
  onConditionChange,
}: {
  botId: string;
  currentTriggerId?: string;
  selectedIceBreakerIds?: string[];
  onConditionChange: (fieldName: 'iceBreakerIds', fieldValue: string[]) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { bot, loading } = useFacebookBot(botId);
  const { claims } = useFacebookBotTriggerClaims(botId, currentTriggerId);
  const iceBreakers = (bot?.iceBreakers || []).filter(({ question }) =>
    Boolean(question),
  );

  if (loading) {
    return <Spinner />;
  }

  if (!iceBreakers.length) {
    return (
      <div className="flex flex-col items-center gap-1 py-4 text-muted-foreground">
        <IconSnowflake className="h-6 w-6" />
        <p>{t('no-ice-breakers')}</p>
      </div>
    );
  }

  const isClaimed = (_id: string) =>
    !selectedIceBreakerIds.includes(_id) &&
    Boolean(claims.iceBreakerIds[_id]?.length);

  const onCheck = (_id: string) =>
    onConditionChange(
      'iceBreakerIds',
      selectedIceBreakerIds.includes(_id)
        ? selectedIceBreakerIds.filter((id) => id !== _id)
        : [...selectedIceBreakerIds, _id],
    );

  return (
    <div className="p-4">
      {iceBreakers.map(({ _id, question }, index) => (
        <div
          key={_id}
          className={cn(
            'flex w-full flex-row items-center gap-4 rounded-lg border px-4 py-2 text-sm font-semibold text-muted-foreground',
            { 'mt-2': index > 0 },
          )}
        >
          <Checkbox
            checked={selectedIceBreakerIds.includes(_id)}
            disabled={isClaimed(_id)}
            onCheckedChange={() => onCheck(_id)}
          />
          <span className={cn('truncate', isClaimed(_id) && 'opacity-60')}>
            {question}
          </span>
          <TriggerClaimNote
            claims={claims.iceBreakerIds[_id]}
            className="ml-auto"
          />
        </div>
      ))}
    </div>
  );
};
