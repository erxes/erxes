import { TypedDocumentNode, useMutation } from '@apollo/client';
import { IRelationInput, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CREATE_MULTIPLE_RELATIONS, GET_RELATIONS_BY_ENTITY } from 'ui-modules';

const CREATE_WIDGET_RELATIONS: TypedDocumentNode<
  unknown,
  { relations: IRelationInput[] }
> = CREATE_MULTIPLE_RELATIONS;

interface CreateWidgetRelationsOptions {
  contentId: string;
  contentType: string;
  relatedContentType: string;
  customerId?: string;
  companyId?: string;
  successMessage: string;
}

export const useCreateWidgetRelations = ({
  contentId,
  contentType,
  relatedContentType,
  customerId,
  companyId,
  successMessage,
}: CreateWidgetRelationsOptions) => {
  const { t } = useTranslation('operation');
  const [createMultipleRelations, { loading }] = useMutation(
    CREATE_WIDGET_RELATIONS,
    {
      refetchQueries: [GET_RELATIONS_BY_ENTITY],
    },
  );

  const createRelations = async (
    relatedId: string,
    projectId?: string,
  ): Promise<boolean> => {
    if (loading) return false;

    const relations: IRelationInput[] = [];
    const addedEntities = new Set<string>();

    const addRelation = (sourceType: string, sourceId?: string) => {
      if (!sourceId) return;
      const key = `${sourceType}:${sourceId}`;
      if (addedEntities.has(key)) return;
      addedEntities.add(key);

      relations.push({
        entities: [
          { contentType: sourceType, contentId: sourceId },
          { contentType: relatedContentType, contentId: relatedId },
        ],
      });
    };

    addRelation(contentType, contentId);
    addRelation('core:customer', customerId);
    addRelation('core:company', companyId);
    addRelation('operation:project', projectId);

    try {
      await createMultipleRelations({ variables: { relations } });
      toast({ title: successMessage, variant: 'success' });
      return true;
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
      return false;
    }
  };

  return { createRelations, loading };
};
