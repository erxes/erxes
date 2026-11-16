import { useWaitEventTimeout } from '@/automations/components/builder/nodes/actions/waitEvent/hooks/useWaitEventTimeout';
import { TWaitEventTimeoutUnit } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { Input, Label, Select, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TAutomationAction } from 'ui-modules';

export const WaitEventTimeoutSection = ({
  currentAction,
  currentActionIndex,
}: {
  currentAction: TAutomationAction;
  currentActionIndex: number;
}) => {
  const { t } = useTranslation('automations');
  const { timeout, enabled, error, setEnabled, updateTimeout } =
    useWaitEventTimeout(currentAction, currentActionIndex);
  const switchId = `wait-timeout-${currentAction.id}`;

  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={switchId}>
          {t('wait-event-timeout', 'Stop waiting after')}
        </Label>
        <Switch id={switchId} checked={enabled} onCheckedChange={setEnabled} />
      </div>
      {enabled && timeout ? (
        <>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              className="w-24"
              value={timeout.value}
              onChange={(event) =>
                updateTimeout({ ...timeout, value: event.target.value })
              }
            />
            <Select
              value={timeout.unit}
              onValueChange={(unit) =>
                updateTimeout({ ...timeout, unit: unit as TWaitEventTimeoutUnit })
              }
            >
              <Select.Trigger className="w-32">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="minutes">{t('minutes', 'Minutes')}</Select.Item>
                <Select.Item value="hours">{t('hours', 'Hours')}</Select.Item>
                <Select.Item value="days">{t('days', 'Days')}</Select.Item>
              </Select.Content>
            </Select>
          </div>
          {error ? (
            <p className="text-xs text-destructive">
              {error === 'too-long'
                ? t('wait-event-timeout-too-long', 'At most 30 days')
                : t('wait-event-timeout-positive', 'Enter a positive number')}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t(
                'wait-event-timeout-description',
                'The node gets a Met and a Timed out exit. A Timed out exit left empty continues on Met.',
              )}
            </p>
          )}
        </>
      ) : null}
    </div>
  );
};
