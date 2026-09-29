import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useGetTags } from 'ui-modules/modules/tags-new/hooks/useTags';
import {
  CUSTOMER_RELATION_TYPE,
  useBroadcastChooser,
} from './useBroadcastChooser';

export type TBroadcastTagOption = {
  _id: string;
  name?: string;
  /** Set on a tag group: the tags picked through it. */
  children?: TBroadcastTagOption[];
};

/**
 * The customer tags a campaign can target, grouped the way the tags module
 * groups them, and picking one or a whole group. The audience size follows
 * the selection, summed from each tag's customer count.
 */
export const useBroadcastTagSelection = ({
  value = [],
  onChange,
}: {
  value?: string[];
  onChange: (value: string[]) => void;
}) => {
  const { setValue } = useFormContext();
  const {
    tags: allTags,
    tagGroups,
    tagsByParentId,
  } = useGetTags({ variables: { type: 'core:customer' } });
  const { counts, loading } = useBroadcastChooser({
    countTypes: [CUSTOMER_RELATION_TYPE.TAG],
  });

  const tagCounts: Record<string, number> = counts.tag || {};

  const options = useMemo<TBroadcastTagOption[]>(
    () => [
      ...tagGroups.map((group) => ({
        ...group,
        children: tagsByParentId[group._id] || [],
      })),
      ...allTags.filter((tag) => !tag.parentId && !tag.isGroup),
    ],
    [allTags, tagGroups, tagsByParentId],
  );

  const countOf = (id: string) => tagCounts[id] || 0;

  const select = (targetIds: string[]) => {
    onChange(targetIds);
    setValue(
      'targetCount',
      targetIds.reduce((sum, id) => sum + countOf(id), 0),
    );
  };

  const isSelected = (id: string) => value.includes(id);

  const toggle = (id: string) =>
    select(isSelected(id) ? value.filter((v) => v !== id) : [...value, id]);

  const childIds = (group: TBroadcastTagOption) =>
    (group.children || []).map((child) => child._id);

  // A group's heading picks every tag in it, or drops them all when they are
  // already picked.
  const toggleGroup = (group: TBroadcastTagOption) => {
    const ids = childIds(group);

    select(
      ids.every(isSelected)
        ? value.filter((id) => !ids.includes(id))
        : [...new Set([...value, ...ids])],
    );
  };

  const groupCount = (group: TBroadcastTagOption) =>
    childIds(group).reduce((sum, id) => sum + countOf(id), 0);

  const hasSelectedChild = (group: TBroadcastTagOption) =>
    childIds(group).some(isSelected);

  return {
    options,
    loading,
    countOf,
    isSelected,
    toggle,
    toggleGroup,
    groupCount,
    hasSelectedChild,
  };
};
