import { Badge, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationExecutionActionResultProps } from 'ui-modules';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const getStringValue = (
  source: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = source[key];

  return typeof value === 'string' && value ? value : undefined;
};

const getSentMessage = (result: unknown) => {
  if (!isRecord(result)) {
    return undefined;
  }

  const message = isRecord(result.result) ? result.result : result;

  return getStringValue(message, 'content');
};

export const AutomationHistoryResult = ({
  result,
}: AutomationExecutionActionResultProps) => {
  const { t } = useTranslation('frontline');
  const error = isRecord(result) ? getStringValue(result, 'error') : undefined;

  if (error) {
    return (
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <Badge variant="destructive">{t('error')}</Badge>
          </Tooltip.Trigger>
          <Tooltip.Content>{error}</Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    );
  }

  const content = getSentMessage(result);

  if (!content) {
    return <Badge variant="secondary">{t('no-message-configured')}</Badge>;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger>
          <Badge variant="success">{t('sent-successfully')}</Badge>
        </Tooltip.Trigger>
        <Tooltip.Content>{content}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
