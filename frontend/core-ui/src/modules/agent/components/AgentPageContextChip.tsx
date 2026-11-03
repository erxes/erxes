import { IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { getAgentReferenceTarget } from '../references/agentReferenceTargets';
import type { TAgentReferenceType } from '../references/parseAgentReferences';

export interface IAgentPageContextChipProps {
  record: { type: TAgentReferenceType; id: string };
  onDismiss: () => void;
}

/**
 * Dismissible chip in the side-panel composer showing the record page
 * context that will be sent with the next turn.
 */
export const AgentPageContextChip = ({
  record,
  onDismiss,
}: IAgentPageContextChipProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const target = getAgentReferenceTarget(record.type);
  const Icon = target.icon;

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">
        {t('viewing', 'Viewing')} ·{' '}
        {t(`reference-types.${record.type}`, record.type)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-4 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground"
        onClick={onDismiss}
        aria-label={t('remove-context', 'Remove page context')}
      >
        <IconX className="size-3" />
      </Button>
    </span>
  );
};
