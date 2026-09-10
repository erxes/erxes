import { useNodeLibraryPlacement } from '@/automations/components/builder/sidebar/hooks/useNodeLibraryPlacement';
import { IconArrowRight, IconColumnInsertRight } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const PlacementNode = ({
  label,
  branchLabel,
}: {
  label: string;
  branchLabel?: string;
}) => (
  <span className="flex min-w-0 items-center gap-1">
    <span className="max-w-40 truncate font-medium text-foreground">
      {label}
    </span>
    {branchLabel ? (
      <Badge variant="secondary" className="shrink-0 capitalize">
        {branchLabel}
      </Badge>
    ) : null}
  </span>
);

export const NodeLibraryPlacementNote = () => {
  const placement = useNodeLibraryPlacement();
  const { t } = useTranslation('automations');

  if (!placement?.sourceLabel) {
    return null;
  }

  const { sourceLabel, targetLabel, branchLabel } = placement;

  return (
    <div className="shrink-0 px-5 pt-4">
      <div className="flex items-center gap-2 overflow-hidden rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <IconColumnInsertRight className="size-4 shrink-0" />
        <PlacementNode label={sourceLabel} branchLabel={branchLabel} />
        <IconArrowRight className="size-3 shrink-0" />
        <span className="shrink-0 rounded border border-dashed px-1.5 py-0.5">
          {t('placement-new-node')}
        </span>
        {targetLabel ? (
          <>
            <IconArrowRight className="size-3 shrink-0" />
            <PlacementNode label={targetLabel} />
          </>
        ) : null}
      </div>
    </div>
  );
};
