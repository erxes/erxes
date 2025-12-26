import {
  TagsListRow,
  TagsListRowSkeleton,
} from 'ui-modules/modules/tags-new/components/TagsListRow';
import { useTags } from 'ui-modules/modules/tags-new/hooks/useTags';
import { ScrollArea } from 'erxes-ui';
import { TagsListHead } from 'ui-modules/modules/tags-new/components/TagsListCell';
import { TagsListRowForm } from 'ui-modules/modules/tags-new/components/TagsListRowForm';
import { useAtomValue, useSetAtom } from 'jotai';
import { addingTagAtom } from 'ui-modules/modules/tags-new/states/addingTagAtom';
import { useTagType } from 'ui-modules/modules/tags-new/hooks/useTagType';
import { childTagsMapAtomFamily } from 'ui-modules/modules/tags-new/states/childTagsMap';
import { useEffect } from 'react';
import { tagGroupsAtomFamily } from 'ui-modules/modules/tags-new/states/tagGroupsAtom';
import { IconTagOff } from '@tabler/icons-react';

export const TagsList = () => {
  const addingTag = useAtomValue(addingTagAtom);
  const type = useTagType();
  const setChildTagsMap = useSetAtom(childTagsMapAtomFamily(type));
  const setParentTags = useSetAtom(tagGroupsAtomFamily(type));
  const { rootTags, tagsByParentId, tagGroups, loading } = useTags({
    variables: {
      type: type,
    },
  });
  useEffect(() => {
    setChildTagsMap(tagsByParentId);
    setParentTags(tagGroups);
  }, [tagsByParentId, setChildTagsMap, tagGroups, setParentTags]);

  return (
    <div className="bg-sidebar p-2 rounded-lg basis-full m-3 grow-0 overflow-hidden">
      <div className="h-7 w-full flex items-center px-12 pb-2">
        <TagsListHead className="w-full md:max-w-[30%] pl-2">Name</TagsListHead>
        <TagsListHead className="flex-1 max-md:hidden pl-2">
          Description
        </TagsListHead>
        <TagsListHead className="max-sm:hidden ">Created At</TagsListHead>
      </div>
      <div className="pb-7 h-full">
        <ScrollArea className="h-full shadow-xs rounded-lg [&>div>div]:last:mb-10 relative">
          {addingTag && !addingTag.parentId && <TagsListRowForm />}
          {loading ? (
            Array.from({ length: 15 }).map((_, i) => (
              <TagsListRowSkeleton key={i} />
            ))
          ) : rootTags && rootTags.length > 0 ? (
            rootTags.map((tag) => <TagsListRow key={tag._id} tag={tag} />)
          ) : (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-3 text-muted-foreground items-center justify-center opacity-50 select-none">
              <IconTagOff className="size-16" strokeWidth={1} />
              <span className="font-medium text-lg">No tags found</span>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
