import { TagsListRow } from './TagsListRow';
import { useTags, ITag } from 'ui-modules';
import { Spinner, ScrollArea } from 'erxes-ui';
import { TagsListHead } from './TagsListCell';
import { TagsListRowForm } from './TagsListRowForm';
import { addingTagAtom } from './states/addingTagAtom';
import { useAtomValue } from 'jotai';

export const TagsList = ({ type }: { type: string | null }) => {
  const addingTag = useAtomValue(addingTagAtom);
  const { tags, pageInfo, loading, handleFetchMore } = useTags({
    variables: {
      type: type,
      limit: 100,
    },
  });
  if (!tags) return <Spinner />;
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
        <ScrollArea className="h-full shadow-xs rounded-lg">
          {addingTag && <TagsListRowForm />}
          {tags.map((tag) => (
            <TagsListRow key={tag._id} tag={tag} />
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};
