import type { AssistantMention } from '@erxes/core-contract';
import { useTranslation } from 'react-i18next';
import { MentionSuggestions } from '~/modules/activity/NoteComposer';
import { RecordIcon } from './RecordChip';
import type { useComposerMentions } from './useComposerMentions';

export const MENTION_MENU_ID = 'assistant-mentions';

const useTypeName = () => {
  const { t } = useTranslation('assistant');

  return (mention: AssistantMention) =>
    ({
      customer: t('record.customer', 'Customer'),
      company: t('record.company', 'Company'),
      member: t('record.member', 'Team member'),
      product: t('record.product', 'Product'),
      automation: t('record.automation', 'Automation'),
    })[mention.type];
};

export const MentionMenu = ({ mentions }: { mentions: ReturnType<typeof useComposerMentions> }) => {
  const { t } = useTranslation('assistant');
  const typeName = useTypeName();

  if (!mentions.open) return null;

  if (!mentions.options.length) {
    return mentions.failed ? (
      <p className="absolute inset-x-0 bottom-full mb-2 rounded-md border bg-popover px-3 py-2 text-sm text-destructive-text shadow-md">
        {t('mention.failed', 'Could not search records. Try again.')}
      </p>
    ) : null;
  }

  return (
    <MentionSuggestions
      id={MENTION_MENU_ID}
      label={t('mention.label', 'Mention a record')}
      items={mentions.options}
      keyOf={(mention) => `${mention.type}:${mention.id}`}
      highlight={mentions.highlight}
      placement="above"
      onPick={mentions.pick}
      onHighlight={mentions.setHighlight}
    >
      {(mention) => (
        <>
          <RecordIcon type={mention.type} />
          <span className="min-w-0 flex-1 truncate">{mention.label}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{typeName(mention)}</span>
        </>
      )}
    </MentionSuggestions>
  );
};
