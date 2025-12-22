import { TagsListCell } from './TagsListCell';
import { TagsListColorField } from './columns/TagsListColorField';
import { TagsListNameField } from './columns/TagsListNameField';
import { useTagsAdd } from 'ui-modules/modules/tags/hooks/useTagsAdd';
import { TagsListCreatedAtField } from './columns/TagsListCreatedAtField';
import { TagsListDescriptionField } from './columns/TagsListDescriptionField';
import { addingTagAtom } from './states/addingTagAtom';
import { useAtom } from 'jotai';
import { TAG_DEFAULT_COLORS } from './constants/Colors';

const DEFAULT_COLOR =
  Object.values(TAG_DEFAULT_COLORS)[
    Math.floor(Math.random() * Object.values(TAG_DEFAULT_COLORS).length)
  ];
export const TagsListRowForm = () => {
  const [addingTag, setAddingTag] = useAtom(addingTagAtom);
  const { addTag } = useTagsAdd();

  const handleSave = (value: string) => {
    setAddingTag(null);
    addTag({
      variables: {
        name: value,
        colorCode: DEFAULT_COLOR,
        isGroup: addingTag === 'group',
        type: null,
      },
    });
  };
  return (
    <div className="h-10 w-full shadow-xs flex items-center px-12 group hover:bg-foreground/10 bg-background first:rounded-t-lg last:rounded-b-lg ">
      <TagsListCell className="w-full md:max-w-[30%] gap-2">
        <TagsListColorField
          colorCode={DEFAULT_COLOR}
          isGroup={addingTag === 'group'}
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
