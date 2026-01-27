import { TagsListHead } from '@/settings/tags/components/TagsListCell';
import {
  TagsListRow,
  TagsListRowSkeleton,
} from '@/settings/tags/components/TagsListRow';
import { TagsListRowForm } from '@/settings/tags/components/TagsListRowForm';
import { addingTagAtom } from '@/settings/tags/states/addingTagAtom';
import { childTagsMapAtomFamily } from '@/settings/tags/states/childTagsMap';
import { tagGroupsAtomFamily } from '@/settings/tags/states/tagGroupsAtom';
import { IconTagOff } from '@tabler/icons-react';
import { ScrollArea, useQueryState } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetTags } from 'ui-modules';

export const TagsList = () => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  const [type] = useQueryState<string>('tagType');
  const addingTag = useAtomValue(addingTagAtom);
  const setChildTagsMap = useSetAtom(childTagsMapAtomFamily(type));
  const setParentTags = useSetAtom(tagGroupsAtomFamily(type));
  const { rootTags, tagsByParentId, tagGroups, loading } = useGetTags({
    variables: {
      excludeWorkspaceTags: true,
      type: type,
    },
  });
  useEffect(() => {
    setChildTagsMap(tagsByParentId);
    setParentTags(tagGroups);
  }, [tagsByParentId, setChildTagsMap, tagGroups, setParentTags]);

  useEffect(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollableElement = scrollAreaRef.current.querySelector(
          '[data-radix-scroll-area-viewport]',
        );
        if (scrollableElement) {
          scrollableElement.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      }
    }, 100);
  }, [addingTag]);

  return (
    <div className="bg-sidebar p-2 rounded-lg basis-full m-3 grow-0 overflow-hidden">
      <div className="h-7 w-full flex items-center px-12 pb-2">
        <TagsListHead className="w-full md:max-w-[30%] pl-2">
          {t('name')}
        </TagsListHead>
        <TagsListHead className="flex-1 max-md:hidden pl-2">
          {t('description')}
        </TagsListHead>
        <TagsListHead className="max-sm:hidden ">
          {t('created-at')}
        </TagsListHead>
      </div>
      <div className="pb-7 h-full">
        <ScrollArea
          className="h-full shadow-xs rounded-lg [&>div>div]:last:mb-10 relative"
          ref={scrollAreaRef}
        >
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
              <span className="font-medium text-lg">{t('not-found')}</span>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
