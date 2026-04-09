import { IconInfoCircle } from '@tabler/icons-react';
import { Alert, Label, Select, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FacebookPostSelector } from '~/widgets/automations/modules/facebook/components/FacebookPostSelector';
import { useOpenThreadTriggerEditor } from '../../hooks/useOpenThreadTriggerEditor';
import {
  TMessageTriggerSourceIds,
  TMessageTriggerSourceMode,
} from '../../types/messageTrigger';

type Props = {
  botId: string;
  sourceMode: TMessageTriggerSourceMode;
  sourceIds: TMessageTriggerSourceIds;
  onSourceModeChange: (value: TMessageTriggerSourceMode) => void;
  onSourceIdsChange: (value: TMessageTriggerSourceIds) => void;
};

const SOURCE_MODE_OPTIONS: Array<{
  value: TMessageTriggerSourceMode;
  label: string;
  description: string;
}> = [
  {
    value: 'all',
    label: 'All send message entries',
    description: 'Trigger on any open thread entry point',
  },
  {
    value: 'specific',
    label: 'Specific sources',
    description: 'Match only selected ad or post source ids',
  },
];

export const OpenThreadTriggerEditor = ({
  botId,
  sourceMode,
  sourceIds = [],
  onSourceModeChange,
  onSourceIdsChange,
}: Props) => {
  const { t } = useTranslation('automations');
  const { selectedSourceId, handleSourceIdChange, isSpecificMode } =
    useOpenThreadTriggerEditor({ sourceIds, onSourceIdsChange });

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Type</Label>
        <Select
          value={sourceMode}
          onValueChange={(value) =>
            onSourceModeChange(value as TMessageTriggerSourceMode)
          }
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {SOURCE_MODE_OPTIONS.map(({ value, label }) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>

        <p className="text-xs text-muted-foreground">
          {SOURCE_MODE_OPTIONS.find((option) => option.value === sourceMode)
            ?.description || ''}
        </p>
      </div>

      <Alert>
        <IconInfoCircle className="size-4" />
        <Alert.Title>
          {t('facebook-open-thread-info-title', {
            defaultValue: 'Open Thread works on referral events',
          })}
        </Alert.Title>
        <Alert.Description>
          <p>
            {t('facebook-open-thread-info-description', {
              defaultValue:
                'Some channels do not send referral webhooks on click only. This trigger runs only when Meta sends an open thread referral event.',
            })}
          </p>
          <p className="mt-2">
            {t('facebook-open-thread-info-hint', {
              defaultValue:
                'If you need a reliable automation start, use Direct Message and trigger after the customer sends a message.',
            })}
          </p>
        </Alert.Description>
      </Alert>

      {isSpecificMode(sourceMode) ? (
        <div className={cn('space-y-2', { blur: !botId })}>
          <Label className="text-sm font-semibold">Post</Label>
          <FacebookPostSelector
            botId={botId}
            selectedPostId={selectedSourceId}
            onSelect={handleSourceIdChange}
          />
        </div>
      ) : null}
    </div>
  );
};
