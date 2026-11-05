import { IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { getAgentReferenceTarget } from '../references/agentReferenceTargets';
import type { TAgentReferenceType } from '../references/parseAgentReferences';

export interface IAgentPageContextChipProps {
  record?: { type: TAgentReferenceType; id: string };
  pageLabel?: string;
  onDismiss: () => void;
}

/** Shows the page or record context that will be sent with the next turn. */
export const AgentPageContextChip = ({
  record,
  pageLabel,
  onDismiss,
}: IAgentPageContextChipProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const target = getAgentReferenceTarget(record?.type ?? 'page');
  const Icon = target.icon;
  const label = record
    ? t(`reference-types.${record.type}`, record.type)
    : (pageLabel ?? t('current-page', 'Current page'));

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">
        {t('viewing', 'Viewing')} · {label}
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
