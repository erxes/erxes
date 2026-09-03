import { Form, Popover } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BroadcastSelectTargetType } from './select/BroadcastSelectTargetType';
import { BroadcastBrandStep } from './steps/BroadcastBrandStep';
import { BroadcastSegmentStep } from './steps/BroadcastSegmentStep';
import { BroadcastTagStep } from './steps/BroadcastTagStep';

const BROADCAST_TARGET_CONTENT = {
  segment: BroadcastSegmentStep,
  tag: BroadcastTagStep,
  brand: BroadcastBrandStep,
};

export const BroadcastTargetPopover = () => {
  const { control, watch } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  const targetType: 'tag' | 'segment' | 'brand' = watch('targetType');
  const targetIds: string[] = watch('targetIds');
  const targetCount = watch('targetCount');

  const TargetContent = BROADCAST_TARGET_CONTENT[targetType];

  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-sm text-muted-foreground">
        {t('to')}
      </span>

      <Popover>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex-1 text-left text-sm text-muted-foreground hover:text-foreground py-1"
          >
            {targetIds?.length
              ? t('recipientsCount', { count: targetCount || 0 })
              : t('selectRecipients')}
          </button>
        </Popover.Trigger>
        <Popover.Content className="w-96 flex flex-col gap-3" align="start">
          <Form.Field
            name="targetType"
            control={control}
            rules={{ required: 'Target type is required' }}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('to')}</Form.Label>
                <Form.Control>
                  <BroadcastSelectTargetType
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />

          <Form.Field
            name="targetIds"
            control={control}
            rules={{ required: 'Customer are required' }}
            render={({ field }) => (
              <Form.Item className="max-h-80 overflow-hidden">
                <Form.Control>
                  <TargetContent {...field} />
                </Form.Control>
              </Form.Item>
            )}
          />
        </Popover.Content>
      </Popover>
    </div>
  );
};
