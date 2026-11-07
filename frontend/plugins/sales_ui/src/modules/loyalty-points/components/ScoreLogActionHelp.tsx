import { IconInfoCircle } from '@tabler/icons-react';
import { Button, Popover, Tooltip } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SCORE_LOG_ACTION_KINDS,
  TScoreLogActionKind,
} from '../scoreLogActions';

const useActionText = () => {
  const { t } = useTranslation('sales');

  return {
    label: (kind: TScoreLogActionKind) => t(`loyalty-action-${kind}`),
    help: (kind: TScoreLogActionKind) => t(`loyalty-action-${kind}-help`),
    title: t('loyalty-action-guide', 'What the actions mean'),
  };
};

/**
 * The action's name, explained on hover. RecordTable sets `leading-0`, so a
 * wrapped label needs its own line height or it has none.
 */
export const ScoreLogActionLabel = ({
  kind,
  fallback,
}: {
  kind: TScoreLogActionKind | null;
  fallback: string;
}) => {
  const text = useActionText();

  if (!kind) {
    return <span className="leading-normal">{fallback}</span>;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span className="cursor-help leading-normal">{text.label(kind)}</span>
        </Tooltip.Trigger>
        <Tooltip.Content className="max-w-xs">
          {text.help(kind)}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

/** Every action with what it means, opened from the column's header. */
export const ScoreLogActionGuide = ({ children }: { children: ReactNode }) => {
  const text = useActionText();

  return (
    <div className="flex items-center gap-1">
      {children}
      <Popover>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            // Above the header's full-size drag handle, which takes every
            // click under it.
            className="relative z-10 size-5"
            aria-label={text.title}
          >
            <IconInfoCircle className="size-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Content align="start" className="w-96">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{text.title}</span>
            {SCORE_LOG_ACTION_KINDS.map((kind) => (
              <div key={kind} className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{text.label(kind)}</span>
                <span className="text-xs text-muted-foreground">
                  {text.help(kind)}
                </span>
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover>
    </div>
  );
};
