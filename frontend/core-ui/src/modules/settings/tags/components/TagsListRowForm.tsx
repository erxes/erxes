import { TagsListCell } from '@/settings/tags/components/TagsListCell';
import { TagsListColorField } from '@/settings/tags/components/fields/TagsListColorField';
import { TagsListNameField } from '@/settings/tags/components/fields/TagsListNameField';
import { useTagAdd, ITag } from 'ui-modules';
import { TagsListCreatedAtField } from '@/settings/tags/components/fields/TagsListCreatedAtField';
import { TagsListDescriptionField } from '@/settings/tags/components/fields/TagsListDescriptionField';
import { addingTagAtom } from '@/settings/tags/states/addingTagAtom';
import { useAtom } from 'jotai';
import { TAG_DEFAULT_COLORS } from '@/settings/tags/constants/Colors';
import { useQueryState, cn, usePreviousHotkeyScope, useToast } from 'erxes-ui';
import { useMemo } from 'react';

export const TagsListRowForm = () => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();
  const [addingTag, setAddingTag] = useAtom(addingTagAtom);
  const { toast } = useToast();
  const DEFAULT_COLOR = useMemo(() => {
    return Object.values(TAG_DEFAULT_COLORS)[
      Math.floor(Math.random() * Object.values(TAG_DEFAULT_COLORS).length)
    ];
  }, []);
  const { addTag } = useTagAdd();
  const [type] = useQueryState<string>('tagType');

  const handleSave = (value: string) => {
    // Validate that name is not empty before saving
    if (!value || value.trim().length === 0) {
      toast({
        title: 'Error',
        description: 'Tag name cannot be empty',
        variant: 'destructive',
      });
      return; // Don't save empty tags
    }
    setAddingTag(null);
    addTag({
      variables: {
        name: value.trim(),
        colorCode: DEFAULT_COLOR,
        ...addingTag,
        type: type,
      },
    });
    goBackToPreviousHotkeyScope();
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
      <div className="absolute w-px bg-muted-foreground h-(--svg-height) top-0 left-[calc(3.5rem+26px/2)]">
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
          onEscape={() => {
            setAddingTag(null);
            goBackToPreviousHotkeyScope();
          }}
        />
      </TagsListCell>
      <TagsListDescriptionField description="" />
      <TagsListCreatedAtField createdAt="" />
    </div>
  );
};
