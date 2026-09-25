import { TAutomationStatsErrorMessage } from '@/automations/types';
import dayjs from 'dayjs';
import { Badge, RelativeDateDisplay } from 'erxes-ui';

const formatErrorCode = (code: string) =>
  code.toLowerCase().split('_').join(' ');

const ErrorMessageRow = ({
  entry,
}: {
  entry: TAutomationStatsErrorMessage;
}) => (
  <div className="flex items-start gap-3 border-b p-3 last:border-b-0">
    <Badge variant="destructive" className="mt-0.5 shrink-0 tabular-nums">
      {entry.count}×
    </Badge>
    <div className="flex min-w-0 flex-col gap-1">
      {/* Messages can be long or a serialised blob, so wrap instead of clip. */}
      <span className="break-words text-sm">{entry.message}</span>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="capitalize">{formatErrorCode(entry.errorCode)}</span>
        {entry.actionTypes.map((actionType) => (
          <span key={actionType} className="font-mono">
            {actionType}
          </span>
        ))}
        {entry.lastAt && (
          <RelativeDateDisplay.Value
            value={dayjs(entry.lastAt).format('YYYY-MM-DD HH:mm:ss')}
          />
        )}
      </div>
    </div>
  </div>
);

export const AutomationStatsErrorMessages = ({
  errorMessages,
}: {
  errorMessages: TAutomationStatsErrorMessage[];
}) => {
  if (!errorMessages.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background">
      <div className="border-b px-4 py-3">
        <span className="text-xs font-medium text-muted-foreground">
          Repeated failures
        </span>
      </div>
      {errorMessages.map((entry) => (
        <ErrorMessageRow
          key={`${entry.errorCode}-${entry.message}`}
          entry={entry}
        />
      ))}
    </div>
  );
};
