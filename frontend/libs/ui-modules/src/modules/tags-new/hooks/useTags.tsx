import { useMemo } from 'react';
import { useQuery, QueryHookOptions } from '@apollo/client';
import { TAGS_QUERY } from '../graphql/tagQueries';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';

export const useTags = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(TAGS_QUERY, options);

  const { allTags, rootTags, tagsByParentId, tagGroups } = useMemo(() => {
    const allTags = (data?.tagsMain || []) as ITag[];
    const rootTags: ITag[] = [];
    const tagsByParentId: Record<string, ITag[]> = {};
    const tagGroups: ITag[] = [];

    allTags.forEach((tag) => {
      if (tag.isGroup) {
        tagGroups.push(tag);
      }
      if (tag.parentId) {
        if (!tagsByParentId[tag.parentId]) {
          tagsByParentId[tag.parentId] = [];
        }
        tagsByParentId[tag.parentId].push(tag);
      } else {
        rootTags.push(tag);
      }
    });

    return { allTags, rootTags, tagsByParentId, tagGroups };
  }, [data?.tagsMain]);

  return {
    tags: allTags,
    rootTags,
    tagsByParentId,
    tagGroups,
    loading,
    error,
  };
};
