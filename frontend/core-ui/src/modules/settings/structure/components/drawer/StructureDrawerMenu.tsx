import {
  IconArchive,
  IconArchiveOff,
  IconDots,
  IconPlus,
} from '@tabler/icons-react';
import { Button, DropdownMenu, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { useStructureEntityMutations } from '../../hooks/useStructureEntityMutations';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { useStructureMembershipSync } from '../../hooks/useStructureMembershipSync';
import { IStructureEntityDetail } from '../../types/structureEntity';
import { isStructureEntityArchived } from '../../utils/structureEntityStatus';

export const StructureDrawerMenu = ({
  entity,
}: {
  entity: IStructureEntityDetail;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { canManage, startDraft } = useStructureWorkspace();
  const { archiveEntity, restoreEntity, archiving } =
    useStructureEntityMutations();
  const syncMembership = useStructureMembershipSync();
  const { success, failure } = useStructureFeedback();
  const { confirm } = useConfirm();
  const archived = isStructureEntityArchived(entity);
  const variables = { _id: entity._id };

  if (!canManage) {
    return null;
  }

  const handleArchive = () =>
    confirm({ message: t('archive-confirm', { title: entity.title }) }).then(
      () =>
        archiveEntity({
          variables,
          onCompleted: () => {
            success(t('node-archived', { title: entity.title }));
            syncMembership([entity._id]);
          },
          onError: failure,
        }),
    );

  const handleRestore = () =>
    restoreEntity({
      variables,
      onCompleted: () => success(t('node-restored', { title: entity.title })),
      onError: failure,
    });

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={archiving}
          aria-label={t('actions')}
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {!archived && (
          <DropdownMenu.Item onSelect={() => startDraft(entity._id)}>
            <IconPlus />
            {t('add-child')}
          </DropdownMenu.Item>
        )}
        {entity.parentId && archived && (
          <DropdownMenu.Item onSelect={handleRestore}>
            <IconArchiveOff />
            {t('restore')}
          </DropdownMenu.Item>
        )}
        {entity.parentId && !archived && (
          <DropdownMenu.Item
            className="text-destructive"
            onSelect={handleArchive}
          >
            <IconArchive />
            {t('archive')}
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
