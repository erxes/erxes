import { Button } from 'erxes-ui';
import { useTagContext } from '@/settings/tags/providers/TagProvider';
import { addingTagAtom } from '@/settings/tags/new/states/addingTagAtom';
import { useAtom } from 'jotai';
export const TagsGroupsAddButtons = () => {
  const { startAddingTag, startAddingGroup } = useTagContext();
  const [addingTag, setAddingTag] = useAtom(addingTagAtom);
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          setAddingTag('group');
          startAddingGroup();
        }}
        variant="outline"
      >
        Add Group
      </Button>
      <Button
        onClick={() => {
          setAddingTag('tag');
          startAddingTag();
        }}
      >
        Add Tag
      </Button>
    </div>
  );
};
