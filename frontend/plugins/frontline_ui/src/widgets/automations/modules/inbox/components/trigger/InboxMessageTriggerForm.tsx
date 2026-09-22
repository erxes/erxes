import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconMessage,
  IconPlayerPlay,
  IconMessageDots,
  IconTicket,
  IconUserPlus,
} from '@tabler/icons-react';
import { Checkbox, cn, Form, toast } from 'erxes-ui';
import type { ComponentType } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
} from 'ui-modules';
import {
  MESSENGER_EVENT_OPTIONS,
  TMessengerEventType,
} from '../../constants/messengerMessageTrigger';
import {
  messengerMessageTriggerFormSchema,
  TMessengerMessageTriggerForm,
} from '../../states/messengerMessageTriggerForm';

const EVENT_ICONS: Record<
  TMessengerEventType,
  ComponentType<{ className?: string }>
> = {
  directMessage: IconMessage,
  getStarted: IconPlayerPlay,
  quickReply: IconMessageDots,
  customerRegistration: IconUserPlus,
  ticketFormSubmission: IconTicket,
  requestCreateTicket: IconTicket,
};

const EVENT_LABELS: Record<TMessengerEventType, string> = {
  directMessage: 'Direct Message',
  getStarted: 'Get Started',
  quickReply: 'Quick Reply',
  customerRegistration: 'Customer Registration',
  ticketFormSubmission: 'Ticket Form Submission',
  requestCreateTicket: 'Request Create Ticket',
};

const EVENT_DESCRIPTIONS: Record<TMessengerEventType, string> = {
  directMessage: 'Fires when the customer sends any text message (default)',
  getStarted: 'Fires when the customer clicks the Get Started button',
  quickReply: 'Fires when the customer clicks a quick reply button',
  customerRegistration:
    'Fires when the customer submits their contact information',
  ticketFormSubmission:
    'Fires when the customer submits a ticket creation form with name and description',
  requestCreateTicket:
    'Fires when the customer clicks the Create Ticket button in the persistent menu',
};

export const InboxMessageTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: AutomationTriggerFormProps<TMessengerMessageTriggerForm>) => {
  const { t } = useTranslation('automations', {
    keyPrefix: 'messenger-message-trigger',
  });

  const existingConditions =
    (activeTrigger?.config?.conditions as
      | Array<{ type: string; isSelected?: boolean }>
      | undefined) || [];

  const defaultConditions = MESSENGER_EVENT_OPTIONS.map((option) => {
    const existing = existingConditions.find((c) => c.type === option.type);
    return {
      type: option.type,
      isSelected: existing ? existing.isSelected ?? false : false,
    };
  });

  const form = useForm<TMessengerMessageTriggerForm>({
    resolver: zodResolver(messengerMessageTriggerFormSchema),
    defaultValues: { conditions: defaultConditions },
  });

  const conditions = form.watch('conditions') ?? [];
  const { submitCount } = form.formState;

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      form.handleSubmit(onSaveTriggerConfig, () => {
        toast({
          title: t('validation-error-title', 'Validation error'),
          description: t(
            'validation-error-description',
            'Select at least one event type',
          ),
          variant: 'destructive',
        });
      })();
    },
  });

  const toggleEvent = (type: TMessengerEventType, selected: boolean) => {
    const next = conditions.map((c) =>
      c.type === type ? { ...c, isSelected: selected } : c,
    );
    form.setValue('conditions', next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const hasSelectionError =
    submitCount > 0 && !conditions.some((c) => c.isSelected);

  return (
    <Form {...form}>
      <div className="flex h-full flex-col p-4 gap-3">
        <p className="text-sm text-muted-foreground">
          {t(
            'description',
            'Select which messenger widget events should trigger this automation.',
          )}
        </p>
        <Form.Field
          control={form.control}
          name="conditions"
          render={() => (
            <Form.Item>
              <Form.Label>{t('triggers', 'Triggers')}</Form.Label>
              <div className="flex flex-col gap-3">
                {conditions.map((condition) => {
                  const option = MESSENGER_EVENT_OPTIONS.find(
                    (o) => o.type === condition.type,
                  );
                  if (!option) return null;
                  const Icon =
                    EVENT_ICONS[condition.type as TMessengerEventType];
                  const label =
                    EVENT_LABELS[condition.type as TMessengerEventType];
                  const description =
                    EVENT_DESCRIPTIONS[condition.type as TMessengerEventType];

                  return (
                    <div
                      key={condition.type}
                      className={cn(
                        'flex items-center gap-3 rounded border p-4 transition-colors cursor-pointer',
                        condition.isSelected
                          ? 'border-primary bg-muted/40'
                          : 'bg-background',
                      )}
                      onClick={() =>
                        toggleEvent(
                          condition.type as TMessengerEventType,
                          !condition.isSelected,
                        )
                      }
                    >
                      <Checkbox
                        checked={condition.isSelected}
                        onCheckedChange={(checked) =>
                          toggleEvent(
                            condition.type as TMessengerEventType,
                            Boolean(checked),
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex size-9 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {hasSelectionError && (
                <p className="text-xs text-destructive mt-1">
                  {t('event-required', 'Select at least one event type')}
                </p>
              )}
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
