import type { Activity } from '@erxes/core-contract';
import { IconMoodPlus, IconPhoneCall } from '@tabler/icons-react';
import { Button, cn, Input, Label, Popover, Select, Textarea } from 'erxes-ui';
import { useState } from 'react';
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
            people.includes(user.id) ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent',
          )}
        >
          {emoji} {people.length}
        </button>
      ))}
      <Popover>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-5 items-center rounded-full px-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent"
            aria-label={t('react', 'React')}
          >
            <IconMoodPlus className="size-3.5" />
          </button>
        </Popover.Trigger>
        <Popover.Content className="w-auto p-1" align="start">
          <div className="flex gap-1">
            {QUICK.map((emoji) => (
              <button key={emoji} type="button" className="rounded p-1 text-base hover:bg-accent" onClick={() => react.mutate({ id: activity.id, emoji })}>
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
      <Popover.Trigger asChild>
        <button type="button" className="hover:underline">
          · {t('edited', 'edited')}
        </button>
      </Popover.Trigger>
      <Popover.Content className="w-80 space-y-2 text-sm" align="start">
        <p className="text-xs font-medium text-muted-foreground">{t('earlier-versions', 'Earlier versions')}</p>
        {[...history].reverse().map((entry, index) => (
          <div key={index} className="rounded border p-2">
            <p className="text-xs text-muted-foreground">{new Date(entry.editedAt).toLocaleString()}</p>
            <p className="whitespace-pre-wrap">{entry.body}</p>
          </div>
        ))}
      </Popover.Content>
    </Popover>
  );
};

const KINDS = ['call', 'meeting', 'email', 'message'] as const;

/** Log a call, meeting, email or message by hand. */
export const LogInteraction = ({ targetType, targetId }: { targetType: string; targetId: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { log } = useNoteActions();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<(typeof KINDS)[number]>('call');
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [outcome, setOutcome] = useState('');
  const [minutes, setMinutes] = useState('');
  const [when, setWhen] = useState('');
  const [body, setBody] = useState('');

  const save = () =>
    log
      .mutateAsync({
        targetType,
        targetId,
        kind,
        direction,
        outcome: outcome || undefined,
        durationMinutes: minutes ? Number(minutes) : undefined,
        occurredAt: when ? new Date(when).toISOString() : undefined,
        body: body || undefined,
        mentions: [],
      })
      .then(() => {
        setOpen(false);
        setOutcome('');
        setMinutes('');
        setWhen('');
        setBody('');
      });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm">
          <IconPhoneCall />
          {t('log-activity', 'Log activity')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-96 space-y-3" align="start">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>{t('kind', 'What')}</Label>
            <Select value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {KINDS.map((item) => (
                  <Select.Item key={item} value={item}>
                    {t(`interaction.${item}`, item)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('direction', 'Direction')}</Label>
            <Select value={direction} onValueChange={(value) => setDirection(value as typeof direction)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="outbound">{t('outbound', 'We reached out')}</Select.Item>
                <Select.Item value="inbound">{t('inbound', 'They reached out')}</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('outcome', 'Outcome')}</Label>
            <Input value={outcome} placeholder={t('outcome-placeholder', 'Interested, no answer…')} onChange={(event) => setOutcome(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('duration', 'Minutes')}</Label>
            <Input type="number" min={0} value={minutes} onChange={(event) => setMinutes(event.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>{t('when', 'When (empty: now)')}</Label>
          <Input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} />
        </div>
        <Textarea rows={3} value={body} placeholder={t('interaction-notes', 'What was said…')} onChange={(event) => setBody(event.target.value)} />
        <Button className="w-full" disabled={log.isPending} onClick={() => void save()}>
          {t('save', 'Save')}
        </Button>
      </Popover.Content>
    </Popover>
  );
};
