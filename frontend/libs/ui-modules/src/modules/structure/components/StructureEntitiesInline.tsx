import { Skeleton, TextOverflowTooltip, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useStructureEntities } from '../hooks/useStructureEntities';
import { IStructureEntity } from '../types/StructureEntity';

export const StructureEntitiesInline = ({
  entityIds = [],
  entities,
  placeholder,
}: {
  entityIds?: string[];
  entities?: IStructureEntity[];
  placeholder?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'structure-entities' });

  const { structureEntities, loading } = useStructureEntities({
    variables: {
      ids: entityIds,
      limit: entityIds.length,
      includeArchived: true,
    },
    skip: Boolean(entities) || entityIds.length === 0,
  });

  const resolved = entities || structureEntities;

  const labels = entityIds.map(
    (entityId) =>
      resolved.find(({ _id }) => _id === entityId)?.title || entityId,
  );

  if (loading) {
    return <Skeleton className="w-16 h-4" />;
  }

  if (labels.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (labels.length < 3) {
    return <TextOverflowTooltip value={labels.join(', ')} />;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{t('count', { count: labels.length })}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>{labels.join(', ')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
