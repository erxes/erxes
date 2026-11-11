import { SelectVerifiedSender } from '@/settings/mail-config/components/SelectVerifiedSender';
import { EmailContentRequirement } from '@/automations/components/builder/template/EmailContentRequirement';
import { TEmailContentAnswer } from '@/automations/components/builder/template/useEmailContentRequirement';
import { Input, Textarea } from 'erxes-ui';
import { SelectMember, splitAutomationNodeType } from 'ui-modules';
import { useTranslation } from 'react-i18next';

/**
 * Answers the prerequisites core itself owns.
 *
 * A plugin provides a component for its own kinds; core's live here for the
 * same reason — only the mail settings know which senders this organization
 * has verified, and the picker that knows is the one those settings use. It
 * also carries its own empty state, so an organization that has configured no
 * sending yet is told that here rather than after installing.
 */
export const CoreTemplateRequirement = ({
  kind,
  value,
  input,
  defaultValue,
  onChange,
}: {
  kind: string;
  value: unknown;
  // For `core:text`
  input?: { multiline?: boolean; placeholder?: string };
  // What the step holds before an answer, e.g. an email's template text
  defaultValue?: unknown;
  onChange: (value: unknown | null) => void;
}) => {
  const { t } = useTranslation('automations');
  // `core:<module>.<what>`
  const [, moduleName, what] = splitAutomationNodeType(kind);

  // Empty text is no answer, so it keeps installing closed
  if (kind === 'core:text') {
    const Field = input?.multiline ? Textarea : Input;

    return (
      <Field
        value={typeof value === 'string' ? value : ''}
        placeholder={input?.placeholder}
        onChange={(event) =>
          onChange(event.target.value.trim() ? event.target.value : null)
        }
      />
    );
  }

  if (moduleName === 'emails' && what === 'content') {
    return (
      <EmailContentRequirement
        value={value}
        defaultValue={defaultValue as Partial<TEmailContentAnswer> | undefined}
        onChange={onChange}
      />
    );
  }

  if (moduleName === 'emails' && what === 'sender') {
    return (
      <SelectVerifiedSender
        value={(value as { value?: string })?.value || ''}
        // Reported whole, not as an address: one pick then settles both the
        // reply-to and the name shown beside it.
        onChange={(address, sender) =>
          address
            ? onChange({ value: address, name: sender?.name })
            : onChange(null)
        }
        placeholder={t('template-select-verified-sender')}
      />
    );
  }

  // Written as the builder's member picker writes it, so the step shows names
  if (moduleName === 'team' && what === 'members') {
    return (
      <SelectMember
        mode="multiple"
        value={toMemberIds(value)}
        onValueChange={(ids) => {
          const list = Array.isArray(ids) ? ids : ids ? [ids] : [];
          onChange(list.length ? toMemberTokens(list) : null);
        }}
        placeholder={t('template-select-members')}
      />
    );
  }

  return null;
};

// `[[ user.<id> ]]` is the token the builder's member picker stores
const MEMBER_TOKEN = /\[\[\s*user\.([^\]\s]+)\s*\]\]/g;

const toMemberIds = (value: unknown) =>
  typeof value === 'string'
    ? [...value.matchAll(MEMBER_TOKEN)].map(([, id]) => id)
    : [];

const toMemberTokens = (ids: string[]) =>
  ids.map((id) => `[[ user.${id} ]]`).join(',');

const CORE_KINDS = new Set(['emails.sender', 'emails.content', 'team.members']);

/** Whether core can answer this kind at all. */
export const isCoreTemplateRequirement = (kind: string) => {
  const [pluginName, moduleName, what] = splitAutomationNodeType(kind);

  return (
    kind === 'core:text' ||
    (pluginName === 'core' && CORE_KINDS.has(`${moduleName}.${what}`))
  );
};
