import { Button, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TStructureTreeEntity } from '../types/structureEntity';
import { useStructureEntityMutations } from './useStructureEntityMutations';
import { useStructureFeedback } from './useStructureFeedback';

type TMovedEntity = Pick<TStructureTreeEntity, '_id' | 'title' | 'parentId'>;

export const useStructureEntityMove = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { moveEntity } = useStructureEntityMutations();
  const { success, failure } = useStructureFeedback();

  const undo = ({ _id, title }: TMovedEntity, parentId: string) =>
    moveEntity({
      variables: { _id, parentId },
      onCompleted: () => success(t('move-undone', { title })),
      onError: failure,
    });

  return (
    entity: TMovedEntity,
    target: Pick<TStructureTreeEntity, '_id' | 'title'>,
  ) => {
    const previousParentId = entity.parentId;

    return moveEntity({
      variables: { _id: entity._id, parentId: target._id },
      onCompleted: () => {
        const moved = toast({
          title: t('node-moved', { title: entity.title, parent: target.title }),
          variant: 'success',
          action: previousParentId ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                moved.dismiss();
                undo(entity, previousParentId);
              }}
            >
              {t('undo')}
            </Button>
          ) : undefined,
        });
      },
      onError: failure,
    });
  };
};
