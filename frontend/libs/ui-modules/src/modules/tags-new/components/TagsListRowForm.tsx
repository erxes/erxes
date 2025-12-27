import { TagsListCell } from 'ui-modules/modules/tags-new/components/TagsListCell';
import { TagsListColorField } from 'ui-modules/modules/tags-new/components/fields/TagsListColorField';
import { TagsListNameField } from 'ui-modules/modules/tags-new/components/fields/TagsListNameField';
import { useTagAdd } from 'ui-modules/modules/tags-new/hooks/useTagAdd';
import { TagsListCreatedAtField } from 'ui-modules/modules/tags-new/components/fields/TagsListCreatedAtField';
import { TagsListDescriptionField } from 'ui-modules/modules/tags-new/components/fields/TagsListDescriptionField';
import { addingTagAtom } from 'ui-modules/modules/tags-new/states/addingTagAtom';
import { useAtom } from 'jotai';
import { TAG_DEFAULT_COLORS } from 'ui-modules/modules/tags-new/constants/Colors';
import { cn } from 'erxes-ui';
import { useTagType } from 'ui-modules/modules/tags-new/hooks/useTagType';
import { useMemo } from 'react';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';
export const TagsListRowForm = () => {
  const [addingTag, setAddingTag] = useAtom(addingTagAtom);
  const DEFAULT_COLOR = useMemo(() => {
    return Object.values(TAG_DEFAULT_COLORS)[
      Math.floor(Math.random() * Object.values(TAG_DEFAULT_COLORS).length)
    ];
  }, [addingTag]);
  const { addTag } = useTagAdd();
  const tagType = useTagType();

  const handleSave = (value: string) => {
    setAddingTag(null);
    addTag({
      variables: {
        name: value,
        colorCode: DEFAULT_COLOR,
        type: tagType,
        ...addingTag,
      },
    });
  };
  return (
    <div
      className={cn(
        'h-10 w-full shadow-xs flex items-center pr-12 pl-14 group relative hover:bg-foreground/10 bg-background ',
        addingTag &&
          addingTag.parentId &&
          'pl-20 last:[--svg-height:calc(2.5rem/2-10px)] [--svg-height:calc(2.5rem)] [&>div>svg]:block',
        addingTag &&
          !addingTag.parentId &&
          'first:rounded-t-lg last:rounded-b-lg',
      )}
    >
      <div className="absolute w-px bg-muted-foreground h-(--svg-height) top-0 left-[calc(3.5rem+24px/2)]">
        <svg
          className="absolute top-[calc(2.5rem/2-10px)] text-muted-foreground hidden"
          width="14"
          height="8"
          viewBox="0 0 14 8"
          fill="currentColor"
          role="img"
          focusable="false"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0h1v1c0 2.5 2.212 3.546 2.212 3.546L9.737 8.06c.568.306.094 1.186-.474.88l-6.48-3.488S0 4 0 1V0Z"></path>
        </svg>
      </div>
      <TagsListCell className="w-full md:max-w-[30%] gap-2">
        <TagsListColorField
          tag={
            {
              _id: '',
              colorCode: DEFAULT_COLOR,
              isGroup: addingTag?.isGroup,
            } as ITag
          }
        />
        <TagsListNameField
          name=""
          defaultOpen={true}
          handleSave={(value) => handleSave(value)}
          isForm
          onEscape={() => setAddingTag(null)}
        />
      </TagsListCell>
      <TagsListDescriptionField description="" />
      <TagsListCreatedAtField createdAt="" />
    </div>
  );
};
