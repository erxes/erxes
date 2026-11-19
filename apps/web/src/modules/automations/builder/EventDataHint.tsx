import { IconRefresh } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { catalogQuery } from '../automationQueries';

const RECHECK_MS = 5000;

/** The event that starts runs, as far as its data goes: who publishes it and whether one arrived. */
export interface EventDataSource {
  label: string;
  source: string;
  seen?: boolean;
}

/**
 * Why an event offers no data, and what to do about it. erxes learns a plugin event's data from
 * the first one that arrives, so until then this says how to get it and lets the member look again.
 */
export const EventDataHint = ({
  event,
  subject,
}: {
  event: EventDataSource;
  /** The record runs are about, whose details are there to use meanwhile. */
  subject: 'customer' | 'company' | null;
}) => {
  const { t } = useTranslation('automations');
  const waiting = event.source !== 'core' && !event.seen;
  // While it waits it looks again by itself, so the data shows up without a reload.
  const catalog = useQuery({ ...catalogQuery(), refetchInterval: waiting ? RECHECK_MS : false });
  const [checked, setChecked] = useState(false);

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

  return (
    <div className="space-y-2 rounded-md border border-dashed p-3 text-xs">
      <p className="text-sm font-medium">
        {t('event-data-waiting-title', 'No data from this event yet')}
      </p>
      <p className="text-muted-foreground">
        {t(
          'event-data-waiting',
          'erxes learns what “{{event}}” carries the next time it happens. Make it happen once (a test is fine) and its data shows up here within a few seconds.',
          { event: event.label },
        )}
      </p>
      {subject && <p className="text-muted-foreground">{meanwhile}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={catalog.isFetching}
          onClick={() => void catalog.refetch().then(() => setChecked(true))}
        >
          <IconRefresh />
          {t('event-data-check', 'Check again')}
        </Button>
        {checked && !catalog.isFetching && (
          <output className="text-muted-foreground">
            {t('event-data-still-none', 'Nothing has arrived yet.')}
          </output>
        )}
      </div>
    </div>
  );
};
