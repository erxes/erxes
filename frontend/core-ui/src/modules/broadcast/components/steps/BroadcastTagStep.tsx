import { useMemo } from 'react';
import { useGetTags } from 'ui-modules/modules/tags-new/hooks/useTags';
import { BroadcastTagChooser } from '../chooser/BroadcastTagChooser';

export const BroadcastTagStep = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const {
    tags: allTags,
    tagGroups,
    tagsByParentId,
  } = useGetTags({
    variables: {
      type: 'core:customer',
    },
  });

  const tags = useMemo(() => {
    const groupedTags = tagGroups.map((group) => ({
      ...group,
      children: tagsByParentId[group._id] || [],
    }));

    const ungroupedTags = allTags.filter(
      (tag) => !tag.parentId && !tag.isGroup,
    );

    return [...groupedTags, ...ungroupedTags];
  }, [allTags, tagGroups, tagsByParentId]);

  return <BroadcastTagChooser value={value} onChange={onChange} tags={tags} />;
};
