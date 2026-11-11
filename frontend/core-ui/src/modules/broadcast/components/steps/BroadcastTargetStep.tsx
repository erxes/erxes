import { IconUser } from '@tabler/icons-react';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IBroadcastFormData } from '../../hooks/useBroadcastForm';
import { BroadcastSelectTargetType } from '../common/select/BroadcastSelectTargetType';
import { BroadcastSegmentStep } from './BroadcastSegmentStep';
import { BroadcastTagStep } from './BroadcastTagStep';

const BROADCAST_TARGET_CHOOSERS = {
  segment: BroadcastSegmentStep,
  tag: BroadcastTagStep,
};

export const BroadcastTargetStep = () => {
  const { t } = useTranslation('broadcasts');
  const { control, watch } = useFormContext<IBroadcastFormData>();

  const targetType = watch('targetType');
  const targetCount = watch('targetCount');

  // A campaign started from one person in the contacts list is already aimed
  // at them, so there is no audience left to choose.
  const TargetChooser =
    targetType === 'customer'
      ? undefined
      : BROADCAST_TARGET_CHOOSERS[targetType];

  return (
    <form className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      <Form.Field
        name="title"
        control={control}
        rules={{ required: t('target.title-required') }}
        render={({ field }) => (
          <Form.Item className="min-w-0 shrink-0">
            <Form.Label>{t('target.title')}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder={t('target.title')} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      {TargetChooser ? (
        <>
          <Form.Field
            name="targetType"
            control={control}
            rules={{ required: t('target.type-required') }}
            render={({ field }) => (
              <Form.Item className="min-w-0 shrink-0">
                <Form.Label>{t('target.type')}</Form.Label>
                <Form.Control>
                  <BroadcastSelectTargetType
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            name="targetIds"
            control={control}
            rules={{ required: t('target.audience-required') }}
            render={({ field }) => (
              <Form.Item className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 space-y-0">
                <Form.Label className="flex min-w-0 shrink-0 items-center justify-between gap-2 px-2">
                  <div className="flex min-w-0 items-center gap-1">
                    <IconUser size={16} className="shrink-0" />
                    <span className="truncate">{t('target.customers')}</span>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums">
                    {targetCount || 0}
                  </span>
                </Form.Label>
                <Form.Control>
                  <TargetChooser {...field} />
                </Form.Control>
                <Form.Message className="shrink-0" />
              </Form.Item>
            )}
          />
        </>
      ) : (
        <p className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
          <IconUser size={16} />
          {t('target.selected-customers', { count: targetCount || 0 })}
        </p>
      )}
    </form>
  );
};
