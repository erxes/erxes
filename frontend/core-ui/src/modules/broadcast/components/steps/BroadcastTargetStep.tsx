import { IconUser } from '@tabler/icons-react';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BroadcastSelectTargetType } from '../common/select/BroadcastSelectTargetType';
import { BroadcastSegmentStep } from './BroadcastSegmentStep';
import { BroadcastTagStep } from './BroadcastTagStep';

const BROADCAST_TARGET_CHOOSERS = {
  segment: BroadcastSegmentStep,
  tag: BroadcastTagStep,
};

export const BroadcastTargetStep = () => {
  const { t } = useTranslation('broadcasts');
  const { control, watch } = useFormContext();

  const targetType: string = watch('targetType');
  const targetCount = watch('targetCount');

  // A campaign started from one person in the contacts list is already aimed
  // at them, so there is no audience left to choose.
  const TargetChooser =
    BROADCAST_TARGET_CHOOSERS[
      targetType as keyof typeof BROADCAST_TARGET_CHOOSERS
    ];

  return (
    <form className="flex flex-col h-full gap-3">
      <Form.Field
        name="title"
        control={control}
        rules={{ required: t('target.title-required') }}
        render={({ field }) => (
          <Form.Item>
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
              <Form.Item>
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
              <Form.Item className="h-full overflow-hidden">
                <Form.Label className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-1">
                    <IconUser size={16} />
                    <span>{t('target.customers')}</span>
                  </div>
                  <span className="text-xs">{targetCount || 0}</span>
                </Form.Label>
                <Form.Control>
                  <TargetChooser {...field} />
                </Form.Control>
                <Form.Message />
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
