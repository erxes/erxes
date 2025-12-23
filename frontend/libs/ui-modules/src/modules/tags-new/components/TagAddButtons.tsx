import { Button } from 'erxes-ui';
import { addingTagAtom } from 'ui-modules/modules/tags-new/states/addingTagAtom';
import { useAtom } from 'jotai';
import { useTagType } from 'ui-modules/modules/tags-new/hooks/useTagType';
export const TagAddButtons = () => {
  const tagType = useTagType();
  const [addingTag, setAddingTag] = useAtom(addingTagAtom);
  return (
    <div className="flex gap-2">
      <Button
        disabled={addingTag?.isGroup}
        onClick={() => {
          setAddingTag({
            isGroup: true,
            type: tagType as string,
          });
        }}
        variant="outline"
      >
        Add Group
      </Button>
      <Button
        disabled={addingTag !== null && !addingTag?.isGroup}
        onClick={() => {
          setAddingTag({
            isGroup: false,
            type: tagType as string,
          });
        }}
      >
        Add Tag
      </Button>
    </div>
  );
};
