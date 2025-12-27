import { ITag } from 'ui-modules/modules/tags-new/types/Tag';
import { TagsListDescriptionField } from 'ui-modules/modules/tags-new/components/fields/TagsListDescriptionField';
import { TagsListNameField } from 'ui-modules/modules/tags-new/components/fields/TagsListNameField';
import { TagsListCell } from 'ui-modules/modules/tags-new/components/TagsListCell';
import { TagsListCreatedAtField } from 'ui-modules/modules/tags-new/components/fields/TagsListCreatedAtField';
import { TagsListColorField } from 'ui-modules/modules/tags-new/components/fields/TagsListColorField';
import { Collapsible, cn, Skeleton } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { childTagsMapAtomFamily } from 'ui-modules/modules/tags-new/states/childTagsMap';
import { IconCaretRightFilled } from '@tabler/icons-react';
import { TagsListRowOptionMenu } from 'ui-modules/modules/tags-new/components/TagsListRowOptionMenu';
import { TagsListRowForm } from 'ui-modules/modules/tags-new/components/TagsListRowForm';
import { addingTagAtom } from 'ui-modules/modules/tags-new/states/addingTagAtom';
import { useTagType } from 'ui-modules/modules/tags-new/hooks/useTagType';

export const TagsListRow = ({ tag }: { tag: ITag }) => {
  if (tag.isGroup) {
    return <TagsListGroupRow tag={tag} />;
  }
  return <TagsListRowContent tag={tag} />;
};

export const TagsListGroupRow = ({ tag }: { tag: ITag }) => {
  const [open, setOpen] = useState(false);
  const addingTag = useAtomValue(addingTagAtom);
  const type = useTagType();
  const childTagsMap = useAtomValue(childTagsMapAtomFamily(type));
  useEffect(() => {
    if (addingTag && addingTag.parentId === tag._id) {
      setOpen(true);
    }
  }, [addingTag, tag._id]);
  return (
    <Collapsible
      className="first:rounded-t-lg last:rounded-b-lg"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="relative" onClick={() => setOpen(!open)}>
        {(childTagsMap[tag._id] || addingTag?.parentId === tag._id) && (
          <IconCaretRightFilled
            className={cn(
              'size-3 transition-all duration-100 absolute left-10 top-1/2 -translate-y-1/2 z-10 text-muted-foreground',
              open && 'rotate-90',
            )}
          ></IconCaretRightFilled>
        )}
        <TagsListRowContent tag={tag} />
      </div>
      <Collapsible.Content>
        {addingTag && addingTag.parentId === tag._id && <TagsListRowForm />}
        {childTagsMap[tag._id] &&
          childTagsMap[tag._id].map((childTag) => (
            <TagsListRowContent tag={childTag} key={childTag._id} />
          ))}
      </Collapsible.Content>
    </Collapsible>
  );
};

export const TagsListRowContent = ({ tag }: { tag: ITag }) => {
  return (
    <div
      className={cn(
        'h-10 w-full shadow-xs flex items-center pr-12 pl-14 group hover:bg-foreground/10 bg-background relative ',
        tag.parentId &&
          'pl-20 last:[--svg-height:calc(2.5rem/2-10px)] [--svg-height:calc(2.5rem)] [&>div>svg]:block',
      )}
    >
      <TagsListRowOptionMenu tag={tag} />
      <div className="absolute w-px bg-muted-foreground h-(--svg-height) top-0 left-[calc(3.5rem+26px/2)]">
        <svg
          className="absolute top-[calc(2.5rem/2-12px)] text-muted-foreground hidden"
          width="20"
          height="12"
          viewBox="0 0 20 12"
          fill="currentColor"
          role="img"
          focusable="false"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0h1v1c0 2.5 2.212 3.546 2.212 3.546L9.737 8.06c.568.306.094 1.186-.474.88l-6.48-3.488S0 4 0 1V0Z"></path>
        </svg>
      </div>
      <TagsListCell className="w-full md:max-w-[30%] gap-2 ">
        <TagsListColorField tag={tag} />
        <TagsListNameField name={tag.name} id={tag._id} />
      </TagsListCell>
      <TagsListDescriptionField
        description={tag.description || ''}
        id={tag._id}
      />
      <TagsListCreatedAtField createdAt={tag.createdAt || ''} />
    </div>
  );
};

export const TagsListRowSkeleton = () => {
  return (
    <div className="h-10 w-full shadow-xs flex items-center pr-12 pl-14 bg-background">
      <TagsListCell className="w-full md:max-w-[30%] gap-2 ">
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </TagsListCell>
      <TagsListCell className="flex-1 max-md:hidden pr-5">
        <Skeleton className="h-4 w-full" />
      </TagsListCell>
      <TagsListCell className="max-sm:hidden text-sm font-medium">
        <Skeleton className="h-4 w-20" />
      </TagsListCell>
    </div>
  );
};
