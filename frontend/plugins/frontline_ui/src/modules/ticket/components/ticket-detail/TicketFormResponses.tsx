import { InfoCard } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type TTicketFormResponse = {
  _id: string;
  formTitle?: string | null;
  submittedAt?: string | Date | null;
  answers?: Array<{
    fieldId?: string | null;
    label?: string | null;
    value?: unknown;
  } | null> | null;
};

type TProps = {
  responses?: Array<TTicketFormResponse | null> | null;
};

const formatAnswer = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (Array.isArray(value)) {
    return value.map(formatAnswer).join(', ');
  }

  if (typeof value === 'object') {
    const { name, url } = value as { name?: string; url?: string };
    return name || url || '-';
  }

  return String(value);
};

/** Answers the customer gave through form links made for this ticket. */
export const TicketFormResponses = ({ responses }: TProps) => {
  const { t } = useTranslation('frontline');
  const items = (responses || []).filter(
    (response): response is TTicketFormResponse => !!response,
  );

  if (!items.length) {
    return null;
  }

  return (
    <InfoCard title={t('ticket-form-responses', 'Responses')}>
      <InfoCard.Content className="flex flex-col gap-4">
        {items.map((response) => (
          <div key={response._id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground truncate">
                {response.formTitle || t('form', 'Form')}
              </span>
              {response.submittedAt ? (
                <span>{new Date(response.submittedAt).toLocaleString()}</span>
              ) : null}
            </div>
            <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
              {(response.answers || []).map((answer, index) =>
                answer ? (
                  <div key={answer.fieldId || index} className="contents">
                    <dt className="text-muted-foreground truncate">
                      {answer.label || '-'}
                    </dt>
                    <dd className="break-words">{formatAnswer(answer.value)}</dd>
                  </div>
                ) : null,
              )}
            </dl>
          </div>
        ))}
      </InfoCard.Content>
    </InfoCard>
  );
};
