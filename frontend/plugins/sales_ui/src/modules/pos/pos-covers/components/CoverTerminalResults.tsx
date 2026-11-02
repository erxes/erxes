import dayjs from 'dayjs';
import { isDefined, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { PosCoverDetailQuery } from '~/gql/graphql';

type CoverTerminalResultsProps = Pick<
  NonNullable<PosCoverDetailQuery['posCoverDetail']>,
  'details'
>;

const responseText = (response: string): string => {
  try {
    return JSON.stringify(JSON.parse(response), null, 2);
  } catch {
    return response;
  }
};

export const CoverTerminalResults = ({
  details,
}: CoverTerminalResultsProps) => {
  const { t } = useTranslation('sales');
  const payments = (details || [])
    .filter(isDefined)
    .filter((detail) => detail.terminalResults?.some(isDefined));
  return (
    <section className="space-y-3">
      {!payments.length && (
        <p className="text-sm text-muted-foreground">
          {t('cover-no-terminal-results')}
        </p>
      )}
      {payments.map((detail) => (
        <div
          key={detail._id || detail.paidType}
          className="rounded-md border p-3 space-y-3"
        >
          <h4 className="font-medium">{detail.paidType}</h4>
          {(detail.terminalResults || [])
            .filter(isDefined)
            .map((result, index) => (
              <div key={result._id} className="space-y-2 border-t pt-3">
                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {t('cover-terminal-request', { number: index + 1 })}
                  </span>
                  <time dateTime={result.createdAt}>
                    {dayjs(result.createdAt).isValid()
                      ? dayjs(result.createdAt).format('YYYY-MM-DD HH:mm:ss')
                      : '-'}
                  </time>
                </div>
                <Textarea
                  aria-label={t('cover-terminal-response', {
                    paidType: detail.paidType,
                    number: index + 1,
                  })}
                  value={
                    result.response != null
                      ? responseText(result.response)
                      : t('cover-terminal-pending')
                  }
                  readOnly
                  rows={8}
                  className="resize-y bg-muted font-mono text-xs select-text"
                  onKeyDown={(event) => event.stopPropagation()}
                />
              </div>
            ))}
        </div>
      ))}
    </section>
  );
};
