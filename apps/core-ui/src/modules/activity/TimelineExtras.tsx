import type { Activity } from '@erxes/core-contract';
import { IconMoodPlus } from '@tabler/icons-react';
import { Button, cn, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSession } from '~/modules/auth/session';
import { useNoteActions } from './useActivities';

const QUICK = ['👍', '❤️', '🎉', '👀', '✅', '🙏'];

/** Reactions under an entry: counts, mine highlighted, a picker for more. */
export const Reactions = ({ activity }: { activity: Activity }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { user } = useSession();
  const { react } = useNoteActions();
  const entries = Object.entries(activity.reactions ?? {});

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {entries.map(([emoji, people]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => react.mutate({ id: activity.id, emoji })}
          className={cn(
            'inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[11px]',
            people.includes(user.id)
              ? 'border-primary bg-primary/10 text-primary-text'
              : 'hover:bg-accent',
          )}
        >
          {emoji} {people.length}
        </button>
      ))}
      <Popover>
        <Popover.Trigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-5 opacity-0 group-hover:opacity-100 group-hover/note:opacity-100 data-popup-open:opacity-100"
            />
          }
          aria-label={t('react', 'React')}
        >
          <IconMoodPlus className="size-3.5" />
        </Popover.Trigger>
        <Popover.Content variant="compact" className="w-auto" align="start">
          <div className="flex gap-1">
            {QUICK.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded p-1 text-base hover:bg-accent"
                onClick={() => react.mutate({ id: activity.id, emoji })}
              >
                {emoji}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover>
    </span>
  );
};

/** "edited": earlier wordings of a note. */
export const NoteHistory = ({ history }: { history: { body: string; editedAt: string }[] }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });

  return (
    <Popover>
      <Popover.Trigger>
        <span className="hover:underline">· {t('edited', 'edited')}</span>
      </Popover.Trigger>
      <Popover.Content className="w-80" align="start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t('earlier-versions', 'Earlier versions')}
          </p>
          {history.toReversed().map((entry) => (
            <div key={entry.editedAt} className="rounded border p-2">
              <p className="text-xs text-muted-foreground">
                {new Date(entry.editedAt).toLocaleString()}
              </p>
              <p className="whitespace-pre-wrap">{entry.body}</p>
            </div>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
};
