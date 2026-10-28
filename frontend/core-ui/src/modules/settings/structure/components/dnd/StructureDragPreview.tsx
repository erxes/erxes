import { IconArrowRight, IconPlus } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { TStructureDragItem } from '../../utils/structureDrop';
import { StructureEntityTypeIcon } from '../StructureEntityTypeIcon';
import { StructurePersonAvatar } from './StructurePersonChip';

export const StructureDragPreview = ({
  item,
  copy,
}: {
  item: TStructureDragItem;
  copy: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { typesById } = useStructureWorkspace();

  if (item.kind === 'entity') {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium shadow-lg">
        <StructureEntityTypeIcon
          icon={typesById.get(item.entity.typeId)?.icon}
          className="size-4 text-primary"
        />
        {item.entity.title}
      </span>
    );
  }

  const adding = copy || !item.person.membership;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-2 text-sm font-medium shadow-lg">
      <StructurePersonAvatar person={item.person} />
      {item.person.name}
      <Badge variant={adding ? 'success' : 'info'}>
        {adding ? (
          <IconPlus className="size-3" />
        ) : (
          <IconArrowRight className="size-3" />
        )}
        {adding ? t('drop-add') : t('drop-move')}
      </Badge>
    </span>
  );
};
