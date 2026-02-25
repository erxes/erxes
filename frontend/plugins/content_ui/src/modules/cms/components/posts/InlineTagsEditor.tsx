import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { MultipleSelector } from 'erxes-ui';
import { toast } from 'erxes-ui';
import { CMS_POSTS_EDIT } from '../../graphql/queries';
import { useTags } from '../../hooks/useTags';

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
  const [tags, setTags] = useState(initialTags);
  const { tags: allTags, loading: loadingTags } = useTags({
    clientPortalId: websiteId || '',
  });
  const [updatePost] = useMutation(CMS_POSTS_EDIT, {
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error updating tags: ${error.message}`,
        variant: 'destructive',
      });
      // Revert to previous tags on error
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
    return <div>Loading tags...</div>;
  }

  return (
    <MultipleSelector
      options={allTags.map((tag) => ({
        label: tag.name,
        value: tag._id,
      }))}
      value={tags.map((tag) => tag._id)}
      onChange={handleTagChange}
      placeholder="Select tags..."
      className="w-full"
    />
  );
}
