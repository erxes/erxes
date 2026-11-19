import type { AssistantRecordType } from '@erxes/core-contract';
import { IconKey } from '@tabler/icons-react';
import { Button, buttonVariants, cn, Empty, Kbd } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AssistantAvatar } from './AssistantAvatar';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';

const GENERAL = [
  ['suggestion.new-customers', 'Which customers were added this week?'],
  ['suggestion.top-companies', 'List our five most recent companies'],
  ['suggestion.tag', 'Which tags do we use for customers?'],
  ['suggestion.team', 'Who is on our team?'],
] as const;

const ABOUT_RECORD: Record<AssistantRecordType, (readonly [string, string])[]> = {
  customer: [
    ['suggestion.customer-summary', 'Summarize this customer'],
    ['suggestion.customer-tags', 'Which tags does this customer have?'],
  ],
  company: [
    ['suggestion.company-summary', 'Summarize this company'],
    ['suggestion.company-tags', 'Which tags does this company have?'],
  ],
  member: [['suggestion.member-summary', 'Summarize this team member']],
  product: [['suggestion.product-summary', 'Summarize this product']],
  automation: [['suggestion.automation-explain', 'Explain what this automation does']],
};

export const KeyNotice = () => {
  const { t } = useTranslation('assistant');
  const canManage = useCan()('assistant.manage');

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted p-3 text-left text-sm">
      <IconKey aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-2">
        {canManage ? (
          <>
            <p>
              {t(
                'no-key',
                'Add an API key for a model provider to start. Everyone in the organisation uses it.',
              )}
            </p>
            <Link
              to={paths.settings.assistant}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start')}
            >
              {t('add-key', 'Add a key')}
            </Link>
          </>
        ) : (
          <p>{t('no-key-ask', 'Ask an admin to add a model provider key to start.')}</p>
        )}
      </div>
    </div>
  );
};

const Tips = () => {
  const { t } = useTranslation('assistant');

  return (
    <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <span className="text-foreground">
          <Kbd variant="foreground">@</Kbd>
        </span>
        {t('empty.tip-mention', 'mention a record')}
      </span>
      <span className="hidden items-center gap-1 md:inline-flex">
        <span className="text-foreground">
          <Kbd variant="foreground">Ctrl/⌘ K</Kbd>
        </span>
        {t('empty.tip-ask', 'ask from anywhere')}
      </span>
    </p>
  );
};

export const EmptyState = ({
  noKey,
  record,
  onPick,
}: {
  noKey: boolean;
  record: AssistantRecordType | null;
  onPick: (text: string) => void;
}) => {
  const { t } = useTranslation('assistant');
  const [winking, setWinking] = useState(false);
  const suggestions = [...(record ? ABOUT_RECORD[record] : []), ...GENERAL].slice(0, 4);

  return (
    <Empty size="sm" className="min-h-0 overflow-y-auto">
      <Empty.Header>
        <Empty.Media>
          <AssistantAvatar
            size={72}
            state={winking ? 'wink' : 'idle'}
            follow
            label={t('empty.avatar', 'Assistant')}
          />
        </Empty.Media>
        <Empty.Title>
          <h2>{t('empty.title', 'How can I help?')}</h2>
        </Empty.Title>
        <Empty.Description>
          {t('empty.description', 'Ask about your workspace, or ask for a change.')}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        {noKey ? (
          <KeyNotice />
        ) : (
          <ul
            className="flex w-full flex-col gap-2"
            aria-label={t('empty.suggestions', 'Suggestions')}
            onPointerOver={() => setWinking(true)}
            onPointerLeave={() => setWinking(false)}
          >
            {suggestions.map(([key, text]) => (
              <li key={key}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onPick(t(key, text))}
                >
                  {t(key, text)}
                </Button>
              </li>
            ))}
          </ul>
        )}
        {!noKey && <Tips />}
      </Empty.Content>
    </Empty>
  );
};
