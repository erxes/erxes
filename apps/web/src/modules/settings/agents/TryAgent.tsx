import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconRefresh, IconSend } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Spinner, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Reply } from '~/modules/assistant/Reply';

interface Turn {
  id: string;
  from: 'you' | 'agent' | 'error';
  text: string;
}

const turnOf = (from: Turn['from'], text: string): Turn => ({
  id: crypto.randomUUID(),
  from,
  text,
});

/** The conversation so far: the member's messages right, the agent's answers left. */
const Transcript = ({ turns, pending }: { turns: Turn[]; pending: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });

  return (
    <div className="flex min-h-64 flex-col gap-3 rounded-lg border bg-background p-4">
      {!turns.length && (
        <p className="m-auto text-sm text-muted-foreground">
          {t('try-empty', 'Ask what a customer would ask.')}
        </p>
      )}
      {turns.map((turn) =>
        turn.from === 'you' ? (
          <p
            key={turn.id}
            className="max-w-md self-end rounded-lg bg-primary px-3 py-2 text-sm whitespace-pre-wrap text-primary-foreground"
          >
            {turn.text}
          </p>
        ) : turn.from === 'agent' ? (
          <div key={turn.id} className="max-w-2xl rounded-lg bg-muted px-3 py-2">
            <Reply text={turn.text} streaming={false} />
          </div>
        ) : (
          <p key={turn.id} className="text-sm text-destructive-text">
            {turn.text}
          </p>
        ),
      )}
      {pending && <Spinner size="sm" />}
    </div>
  );
};

/** A conversation with the agent as it is saved, under its own access. */
export const TryAgent = ({ agentId }: { agentId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState('');
  const ask = useMutation(orpc.agents.try.mutationOptions());

  const send = () => {
    const message = text.trim();

    if (!message || ask.isPending) return;

    setTurns((was) => [...was, turnOf('you', message)]);
    setText('');

    ask.mutate(
      { id: agentId, text: message, restart: turns.length === 0 },
      {
        onSuccess: ({ answer }) => setTurns((was) => [...was, turnOf('agent', answer)]),
        onError: (failure) => setTurns((was) => [...was, turnOf('error', messageOf(failure))]),
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t(
            'try-intro',
            'It answers as it will answer customers, with only its own access. Not signed in as a customer.',
          )}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={!turns.length || ask.isPending}
          onClick={() => setTurns([])}
        >
          <IconRefresh />
          {t('restart', 'Start again')}
        </Button>
      </div>
      <Transcript turns={turns} pending={ask.isPending} />
      <div className="flex items-end gap-2">
        <Textarea
          aria-label={t('try-message', 'Message')}
          value={text}
          rows={2}
          placeholder={t('try-placeholder', 'Do you have this in size M?')}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              send();
            }
          }}
        />
        <Button
          size="icon"
          aria-label={t('send', 'Send')}
          disabled={!text.trim() || ask.isPending}
          onClick={send}
        >
          <IconSend />
        </Button>
      </div>
    </div>
  );
};
