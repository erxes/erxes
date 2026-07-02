import { IconExternalLink } from '@tabler/icons-react';
import { Badge, Button, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AutomationExecutionActionResultProps } from 'ui-modules';

type TCreateTicketActionResult = {
  ticketId?: string;
  name?: string;
  number?: string;
  error?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const getDisplayValue = (
  source: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = source[key];

  if (typeof value === 'string' && value) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return undefined;
};

const getCreateTicketActionResult = (
  result: unknown,
): TCreateTicketActionResult => {
  if (!isRecord(result)) {
    return {};
  }

  return {
    ticketId:
      getDisplayValue(result, 'ticketId') ||
      getDisplayValue(result, 'targetId') ||
      getDisplayValue(result, '_id'),
    name: getDisplayValue(result, 'name'),
    number: getDisplayValue(result, 'number'),
    error:
      getDisplayValue(result, 'error') || getDisplayValue(result, 'message'),
  };
};

export const CreateTicketActionResult = ({
  result,
}: AutomationExecutionActionResultProps) => {
  const { t } = useTranslation('frontline');
  const ticketResult = getCreateTicketActionResult(result);
  const label =
    ticketResult.name ||
    (ticketResult.number ? `Ticket #${ticketResult.number}` : undefined);

  if (ticketResult.error) {
    return (
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <Badge variant="destructive">{t('error')}</Badge>
          </Tooltip.Trigger>
          <Tooltip.Content>{ticketResult.error}</Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    );
  }

  if (!ticketResult.ticketId) {
    return <span>{label || '-'}</span>;
  }

  return (
    <div>
      <Link
        to={`/frontline/tickets?ticketId=${ticketResult.ticketId}`}
        target="_blank"
      >
        <Button variant="link" className="w-full">
          {t('go-to-ticket', { label: label || ticketResult.ticketId })}
          <IconExternalLink />
        </Button>
      </Link>
    </div>
  );
};
