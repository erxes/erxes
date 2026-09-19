import { cn, Form, Popover, Skeleton } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCustomerDetail } from 'ui-modules';
import { BroadcastSelectTargetType } from './select/BroadcastSelectTargetType';
import { BroadcastSegmentStep } from './steps/BroadcastSegmentStep';
import { BroadcastTagStep } from './steps/BroadcastTagStep';

const BROADCAST_TARGET_CONTENT = {
  segment: BroadcastSegmentStep,
  tag: BroadcastTagStep,
};

const BroadcastLockedCustomerTarget = ({
  customerId,
}: {
  customerId: string;
}) => {
  const { customerDetail, loading } = useCustomerDetail({
    variables: { _id: customerId },
    skip: !customerId,
  });

  if (loading) {
    return <Skeleton className="h-6 flex-1" />;
  }

  const { firstName, lastName, primaryEmail } = customerDetail || {};
  const name = [firstName, lastName].filter(Boolean).join(' ');

  return (
    <span className="flex-1 text-sm text-muted-foreground py-1">
      {name || primaryEmail || customerId}
      {name && primaryEmail ? ` <${primaryEmail}>` : ''}
    </span>
  );
};

export const BroadcastTargetPopover = () => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  const targetType: 'tag' | 'segment' | 'customer' = watch('targetType');
  const targetIds: string[] = watch('targetIds');
  const targetCount = watch('targetCount');

  if (targetType === 'customer') {
    return (
      <div className="flex items-center gap-4">
        <span className="w-24 shrink-0 text-sm text-muted-foreground">
          {t('to')}
        </span>
        <BroadcastLockedCustomerTarget customerId={targetIds?.[0]} />
      </div>
    );
  }

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
            className={cn(
              'flex-1 text-left text-sm text-muted-foreground hover:text-foreground py-1',
              errors.targetIds && 'text-destructive hover:text-destructive',
            )}
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
            rules={{
              validate: (value?: string[]) =>
                (value?.length ?? 0) > 0 || 'Customer are required',
            }}
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
