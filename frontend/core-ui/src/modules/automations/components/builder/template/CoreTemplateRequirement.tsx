import { SelectVerifiedSender } from '@/settings/mail-config/components/SelectVerifiedSender';
import { splitAutomationNodeType } from 'ui-modules';

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
  onChange,
}: {
  kind: string;
  value: unknown;
  onChange: (value: unknown | null) => void;
}) => {
  // `core:<module>.<what>`
  const [, moduleName, what] = splitAutomationNodeType(kind);

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
        placeholder="Select a verified sender"
      />
    );
  }

  return null;
};

/** Whether core can answer this kind at all. */
export const isCoreTemplateRequirement = (kind: string) => {
  const [pluginName, moduleName, what] = splitAutomationNodeType(kind);

  return pluginName === 'core' && moduleName === 'emails' && what === 'sender';
};
