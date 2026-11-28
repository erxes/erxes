import type { AssistantRecordType } from '@erxes/core-contract';
import {
  IconBolt,
  IconBuilding,
  IconFileDescription,
  IconKey,
  IconTag,
  IconUserPlus,
  IconUsersGroup,
  type Icon,
} from '@tabler/icons-react';
import { Button, buttonVariants, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AssistantAvatar } from './AssistantAvatar';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';

type Suggestion = readonly [key: string, text: string, icon: Icon];

const GENERAL: Suggestion[] = [
  ['suggestion.new-customers', 'Which customers were added this week?', IconUserPlus],
  ['suggestion.top-companies', 'List our five most recent companies', IconBuilding],
  ['suggestion.tag', 'Which tags do we use for customers?', IconTag],
  ['suggestion.team', 'Who is on our team?', IconUsersGroup],
];

const ABOUT_RECORD: Record<AssistantRecordType, Suggestion[]> = {
  customer: [
    ['suggestion.customer-summary', 'Summarize this customer', IconFileDescription],
    ['suggestion.customer-tags', 'Which tags does this customer have?', IconTag],
  ],
  company: [
    ['suggestion.company-summary', 'Summarize this company', IconFileDescription],
    ['suggestion.company-tags', 'Which tags does this company have?', IconTag],
  ],
  member: [['suggestion.member-summary', 'Summarize this team member', IconFileDescription]],
  product: [['suggestion.product-summary', 'Summarize this product', IconFileDescription]],
  automation: [['suggestion.automation-explain', 'Explain what this automation does', IconBolt]],
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
                'no-provider',
                'Connect an AI provider in Integrations to start. Everyone in the organisation uses it.',
              )}
            </p>
            <Link
              to={paths.settings.aiIntegrations}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start')}
            >
              {t('connect-provider', 'Connect an AI provider')}
            </Link>
          </>
        ) : (
          <p>{t('no-provider-ask', 'Ask an admin to connect an AI provider in Integrations.')}</p>
        )}
      </div>
    </div>
  );
};

export const EmptyHero = ({ winking }: { winking: boolean }) => {
  const { t } = useTranslation('assistant');

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-end gap-4 px-4 pb-6 text-center">
      <AssistantAvatar
        size={64}
        state={winking ? 'wink' : 'idle'}
        follow
        label={t('empty.avatar', 'Assistant')}
      />
      <h2 className="text-2xl font-semibold tracking-tight">
        {t('empty.title', 'How can I help?')}
      </h2>
    </div>
  );
};

export const Suggestions = ({
  noKey,
  record,
  onPick,
  onWink,
}: {
  noKey: boolean;
  record: AssistantRecordType | null;
  onPick: (text: string) => void;
  onWink: (winking: boolean) => void;
}) => {
  const { t } = useTranslation('assistant');
  const suggestions = [...(record ? ABOUT_RECORD[record] : []), ...GENERAL].slice(0, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 pt-2 pb-6">
      {noKey ? (
        <div className="w-full max-w-3xl">
          <KeyNotice />
        </div>
      ) : (
        <ul
          className="flex w-full max-w-3xl flex-wrap justify-center gap-2"
          aria-label={t('empty.suggestions', 'Suggestions')}
          onPointerOver={() => onWink(true)}
          onPointerLeave={() => onWink(false)}
        >
          {suggestions.map(([key, text, Glyph], index) => (
            <li
              key={key}
              className="animate-appear"
              style={{ '--appear-delay': `${index * 60}ms`, '--appear-y': '4px' }}
            >
              <Button variant="outline" tone="muted" onClick={() => onPick(t(key, text))}>
                <Glyph aria-hidden />
                {t(key, text)}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
