import { IconKey } from '@tabler/icons-react';
import { buttonVariants, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AssistantAvatar } from './AssistantAvatar';
import { ASSISTANT_SETTINGS_PATH } from './providers';

const SUGGESTIONS = [
  ['suggestion.new-customers', 'Which customers were added this week?'],
  ['suggestion.top-companies', 'List our five most recent companies'],
  ['suggestion.tag', 'Which tags do we use for customers?'],
  ['suggestion.team', 'Who is on our team?'],
] as const;

export const KeyNotice = () => {
  const { t } = useTranslation('assistant');

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted p-3 text-sm">
      <IconKey aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-2">
        <p>
          {t(
            'no-key',
            'Add an API key for a model provider to start. Keys are saved for your account only.',
          )}
        </p>
        <Link
          to={ASSISTANT_SETTINGS_PATH}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start')}
        >
          {t('add-key', 'Add a key')}
        </Link>
      </div>
    </div>
  );
};

export const EmptyState = ({
  noKey,
  onPick,
}: {
  noKey: boolean;
  onPick: (text: string) => void;
}) => {
  const { t } = useTranslation('assistant');
  const [winking, setWinking] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <AssistantAvatar
          size={72}
          state={winking ? 'wink' : 'idle'}
          follow
          label={t('empty.avatar', 'Assistant')}
        />
        <h2 className="text-lg font-semibold">{t('empty.title', 'How can I help?')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('empty.description', 'Ask about your workspace, or ask for a change.')}
        </p>
      </div>
      {noKey ? (
        <KeyNotice />
      ) : (
        <ul
          className="flex w-full flex-col gap-2"
          aria-label={t('empty.suggestions', 'Suggestions')}
          onPointerOver={() => setWinking(true)}
          onPointerLeave={() => setWinking(false)}
        >
          {SUGGESTIONS.map(([key, text]) => (
            <li key={key}>
              <button
                type="button"
                className="w-full rounded-lg border bg-background px-3 py-2 text-left text-sm outline-none hover:bg-accent focus-visible:shadow-focus"
                onClick={() => onPick(t(key, text))}
              >
                {t(key, text)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
