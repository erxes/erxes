import { useMutation } from '@apollo/client';
import { MultipleSelector, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CMS_POSTS_EDIT } from '../graphql/queries';
import { useTags } from '../hooks/useTags';

type InlineTagsEditorProps = {
  postId: string;
  websiteId?: string;
  initialTags: any[];
};

export function InlineTagsEditor({
  postId,
  websiteId,
  initialTags = [],
}: InlineTagsEditorProps) {
  const { t } = useTranslation('content');
  const [tags, setTags] = useState(initialTags);
  const { tags: allTags, loading: loadingTags } = useTags({
    clientPortalId: websiteId || '',
    fetchAll: true,
  });
  const [updatePost] = useMutation(CMS_POSTS_EDIT, {
    onError: (error) => {
      toast({
        title: t('error'),
        description: t('error-updating-tags', { message: error.message }),
        variant: 'destructive',
      });

      setTags(initialTags);
    },
  });

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const handleTagChange = async (selectedTags: any[]) => {
    try {
      setTags(selectedTags);
      await updatePost({
        variables: {
          _id: postId,
          tagIds: selectedTags.map((t) => t._id),
        },
      });
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  if (loadingTags) {
    return <div>{t('loading-tags')}</div>;
  }

  return (
    <MultipleSelector
      options={allTags.map((tag) => ({
        label: tag.name,
        value: tag._id,
      }))}
      value={tags.map((tag) => tag._id)}
      onChange={handleTagChange}
      placeholder={t('select-tags')}
      className="w-full"
    />
  );
}
