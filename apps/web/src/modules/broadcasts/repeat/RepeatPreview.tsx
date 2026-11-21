import { messageOf } from '@erxes/core-contract/client';
import { Spinner, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { inZone, zoneLabel } from '~/lib/timeZones';
import { useSession } from '~/modules/auth/session';
import { useDescribeRepeat } from './useDescribeRepeat';
import type { RepeatForm } from './useRepeatForm';

/** The rule in words and its next run times on the organisation's clock. */
export const RepeatPreview = ({ form }: { form: RepeatForm }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const describe = useDescribeRepeat();
  const { timezone } = useSession().organization;
  const { preview } = form;

  return (
    <div className="space-y-1.5 rounded-md bg-muted/50 p-2.5 text-xs">
      {form.complete ? (
        <p className="font-medium">{describe(form.rule)}</p>
      ) : (
        <p className="text-muted-foreground">
          {t('repeat.incomplete', 'Pick at least one day, and an end after the start.')}
        </p>
      )}
      {form.complete && preview.error && (
        <p className="text-destructive-text">{messageOf(preview.error)}</p>
      )}
      {form.complete && preview.isPending && <Spinner size="sm" />}
      {form.complete && preview.data && (
        <>
          <p className="text-muted-foreground">
            {t('repeat.next-runs', 'Next runs ({{zone}}):', { zone: zoneLabel(timezone) })}
          </p>
          <ul className="space-y-0.5 tabular-nums">
            {preview.data.runs.map((at) => (
              <li key={at}>{fmt.date(inZone(at, timezone), 'EEE, PP p')}</li>
            ))}
          </ul>
          {preview.data.runs.length === 0 && (
            <p className="text-muted-foreground">{t('repeat.no-runs', 'It would never run.')}</p>
          )}
        </>
      )}
    </div>
  );
};
