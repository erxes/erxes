import { Button } from 'erxes-ui';
import { useTagContext } from '~/modules/tags/providers/TagProvider';

export const TagsGroupsAddButtons = () => {
  const { startAddingTag, startAddingGroup } = useTagContext();
  return (
    <div className="flex gap-2">
      <Button onClick={startAddingGroup} variant="outline">
        Add Group
      </Button>
      <Button onClick={startAddingTag}>Add Tag</Button>
    </div>
  );
};
