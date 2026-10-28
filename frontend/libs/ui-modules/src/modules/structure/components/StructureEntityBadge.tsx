import { Badge, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureEntityById } from '../hooks/useStructureEntityById';
import { IStructureEntity } from '../types/StructureEntity';

export const StructureEntityBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    entity?: IStructureEntity;
    entityId?: string;
    renderAsPlainText?: boolean;
    showMissingId?: boolean;
  }
>(({ entity, entityId, renderAsPlainText, showMissingId, ...props }, ref) => {
  const { t } = useTranslation('common', { keyPrefix: 'structure-entities' });
  const { structureEntity, loading } = useStructureEntityById(entityId, {
    skip: !!entity,
  });

  const entityValue = entity || structureEntity;

  if (loading) {
    return <Skeleton className="w-8 h-4" />;
  }

  if (!entityValue) {
    if (!showMissingId || !entityId) {
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={entityId} />;
    }

    return (
      <Badge
        ref={ref}
        variant="secondary"
        className="font-mono"
        title={t('unknown-id', { id: entityId })}
        onClose={props.onClose}
      >
        <span className="max-w-24 truncate">{entityId}</span>
      </Badge>
    );
  }

  const code = entityValue.code && (
    <span className="text-muted-foreground shrink-0">{entityValue.code}</span>
  );

  if (renderAsPlainText) {
    return (
      <span className="flex overflow-hidden gap-2 items-center">
        {code}
        <TextOverflowTooltip value={entityValue.title} />
      </span>
    );
  }

  return (
    <Badge ref={ref} {...props}>
      {code}
      <TextOverflowTooltip value={entityValue.title} />
    </Badge>
  );
});

StructureEntityBadge.displayName = 'StructureEntityBadge';
