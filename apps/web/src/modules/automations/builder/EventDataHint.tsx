import { IconHourglass } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Listening } from '~/components/Listening';

/** The event that starts runs, as far as its data goes: who publishes it and whether one arrived. */
export interface EventDataSource {
  label: string;
  source: string;
  seen?: boolean;
}

/**
 * Why an event offers no data, and what to do about it. erxes learns a plugin event's data from
 * the first one that arrives and pushes the change, so the data shows up here by itself.
 */
export const EventDataHint = ({
  event,
  subject,
  compact,
}: {
  event: EventDataSource;
  /** The record runs are about, whose details are there to use meanwhile. */
  subject: 'customer' | 'company' | null;
  /** In a list of data to insert: two lines, so the rows below stay in view. */
  compact?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const waiting = event.source !== 'core' && !event.seen;

  const meanwhile =
    subject === 'company'
      ? t('event-data-use-company', 'You can already use the company’s details.')
      : t('event-data-use-customer', 'You can already use the customer’s details.');

  if (!waiting) {
    return (
      <p className="text-xs text-muted-foreground">
        {t('event-data-none', '“{{event}}” carries no data of its own.', { event: event.label })}
        {subject && ` ${meanwhile}`}
      </p>
    );
  }

  if (compact) {
    return (
      <div className="flex items-start gap-2.5 text-xs">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <IconHourglass className="size-3.5" />
        </span>
        <p className="min-w-0 text-muted-foreground">
          <Listening>
            {t(
              'event-data-waiting-short',
              'Waiting for the next “{{event}}”. Its data shows up here as soon as it arrives.',
              { event: event.label },
            )}
          </Listening>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-dashed p-3 text-xs">
      <p className="text-sm font-medium">
        <Listening>{t('event-data-waiting-title', 'No data from this event yet')}</Listening>
      </p>
      <p className="text-muted-foreground">
        {t(
          'event-data-waiting',
          'erxes learns what “{{event}}” carries the next time it happens. Make it happen once (a test is fine) and its data shows up here by itself.',
          { event: event.label },
        )}
      </p>
      {subject && <p className="text-muted-foreground">{meanwhile}</p>}
    </div>
  );
};
