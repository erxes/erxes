import * as React from 'react';
import { IconPlus, IconX } from '@tabler/icons-react';
import { useApolloClient } from '@apollo/client';
import { useProductTags } from '@/products/hooks/useProductTags';
import { AlertDialog, Button, useToast } from 'erxes-ui';
import { useProductsEdit } from '../../hooks/useProductsEdit';
import { TagsManagerProps } from '../types/tagsTypes';
import { useRemoveTag } from '@/settings/tags/hooks/useRemoveTag';
import { CreateTagForm, ITag } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export function TagsManager({
  productId,
  initialTags = [],
  uom = '',
  onTagsUpdated,
}: TagsManagerProps) {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const client = useApolloClient();
  const { toast } = useToast();
  const { tags: availableTags = [], refetch } = useProductTags() || {};
  const [tags, setTags] = React.useState<string[]>(() =>
    initialTags.map((tag) => (typeof tag === 'string' ? tag : tag._id)),
  );

  const [isEditingTags, setIsEditingTags] = React.useState(false);
  const [showTagCreator, setShowTagCreator] = React.useState(false);
  const [tagToDelete, setTagToDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const { productsEdit } = useProductsEdit();
  const { removeTag, loading: removeLoading } = useRemoveTag();
  const confirmTagDeletion = (tagId: string, tagName: string) => {
    setTagToDelete({ id: tagId, name: tagName });
  };
  const refreshData = async () => {
    try {
      if (refetch) {
        await refetch();
      }
      await client.refetchQueries({
        include: ['Tags'],
      });

      if (onTagsUpdated) {
        onTagsUpdated();
      }
    } catch (error) {
      toast({
        title: t('error-refreshing-data'),
        variant: 'destructive',
      });
    }
  };
  const handleRemoveTag = async () => {
    if (!tagToDelete) return;

    try {
      await removeTag(tagToDelete.id);
      setTags((prevTags) => prevTags.filter((tag) => tag !== tagToDelete.id));

      toast({
        title: t('tag-removed'),
        description: t('tag-removed-description', { name: tagToDelete.name }),
        variant: 'success',
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to remove tag:', error);
      toast({
        title: t('error-removing-tag'),
        description: t('error-removing-tag-description'),
        variant: 'destructive',
      });
    } finally {
      setTagToDelete(null);
    }
  };
  const handleSaveTags = async (selectedTags: string[]) => {
    if (!productId) return;

    setIsEditingTags(true);

    try {
      await productsEdit({
        variables: {
          _id: productId,
          tagsId: selectedTags,
          uom,
        },
      });

      toast({
        title: t('tags-updated'),
        description: t('tags-updated-description'),
        variant: 'default',
      });

      await refreshData();
    } catch (error) {
      console.error('Error updating tags:', error);
      toast({
        title: t('error-updating-tags'),
        description: t('error-updating-tags-description'),
        variant: 'destructive',
      });
    } finally {
      setIsEditingTags(false);
    }
  };
  const handleTagCreated = (newTag: ITag) => {
    const updatedTags = [...tags, newTag._id];
    setTags(updatedTags);
    handleSaveTags(updatedTags);
    setShowTagCreator(false);

    toast({
      title: t('tag-created'),
      description: t('tag-created-description', { name: newTag.name }),
      variant: 'default',
    });
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="flex items-center gap-2 rounded-full"
        onClick={() => setShowTagCreator(!showTagCreator)}
        disabled={isEditingTags}
      >
        <IconPlus className="h-4 w-4" />
        <span>{t('add-tag')}</span>
      </Button>

      {showTagCreator && (
        <div className="mb-4">
          <CreateTagForm
            tagType="core:product"
            onCompleted={handleTagCreated}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const tagId = typeof tag === 'string' ? tag : tag._id;
          const tagName = typeof tag === 'string' ? tag : tag.name;

          return (
            <div
              key={tagId}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5"
            >
              <span className="text-sm font-medium">{tagName}</span>
              <button
                onClick={() => confirmTagDeletion(tagId, tagName)}
                className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                title={t('remove-tag')}
                aria-label={t('remove-tag-name', { name: tagName })}
                disabled={isEditingTags || removeLoading}
                type="button"
              >
                <IconX className="h-4 w-4" />
                <span className="sr-only">
                  {t('remove-name', { name: tagName })}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <AlertDialog
        open={!!tagToDelete}
        onOpenChange={() => setTagToDelete(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>{t('delete-tag')}</AlertDialog.Title>
            <AlertDialog.Description>
              {t('confirm-delete-tag', { name: tagToDelete?.name })}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
            <AlertDialog.Action onClick={handleRemoveTag}>
              {t('yes-delete-tag')}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </div>
  );
}
