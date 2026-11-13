import {
  readActionResultShape,
  TActionResultShape,
  TResultMessage,
} from '@/automations/utils/automationHistoryUtils/actionResultShape';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActionResult } from 'ui-modules';

const ResultMessage = ({ message }: { message: TResultMessage }) => {
  const { t } = useTranslation('automations');

  return (
    <div className="min-w-0 space-y-2 p-2">
      {message.text && (
        <p className="whitespace-pre-wrap break-words text-xs">
          {message.text}
        </p>
      )}
      {message.buttons.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {message.buttons.map((button, index) => (
            <Badge
              key={`${button}-${index}`}
              variant="secondary"
              className="max-w-full whitespace-normal break-all"
            >
              {button}
            </Badge>
          ))}
        </div>
      )}
      {message.attachmentCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('history-result-attachments', {
            count: message.attachmentCount,
          })}
        </p>
      )}
    </div>
  );
};

/**
 * Lays out a result by its shape. Shapes it cannot read render nothing, so
 * the caller decides what an unreadable result says.
 */
export const ActionResultShapeView = ({
  shape,
}: {
  shape: TActionResultShape;
}) => {
  const { t } = useTranslation('automations');

  if (shape.kind === 'text') {
    return (
      <ActionResult.Status>
        <span className="whitespace-pre-wrap">{shape.text}</span>
      </ActionResult.Status>
    );
  }

  if (shape.kind === 'messages') {
    return (
      <>
        <ActionResult.Status>
          {t('history-result-messages', { count: shape.messages.length })}
        </ActionResult.Status>
        <div className="divide-y divide-border rounded-md border">
          {shape.messages.map((message, index) => (
            <ResultMessage key={index} message={message} />
          ))}
        </div>
      </>
    );
  }

  if (shape.kind === 'fields') {
    return (
      <ActionResult.Fields>
        {shape.fields.map(([label, value]) => (
          <ActionResult.Field key={label} label={label} value={value} />
        ))}
      </ActionResult.Fields>
    );
  }

  return null;
};

export const isReadableResultShape = (shape: TActionResultShape) =>
  shape.kind === 'text' || shape.kind === 'messages' || shape.kind === 'fields';

/** For a successful action that has no renderer of its own. */
export const GenericActionResult = ({ value }: { value: unknown }) => {
  const { t } = useTranslation('automations');
  const shape = readActionResultShape(value);

  return isReadableResultShape(shape) ? (
    <ActionResultShapeView shape={shape} />
  ) : (
    <ActionResult.Status>{t('history-result-completed')}</ActionResult.Status>
  );
};
