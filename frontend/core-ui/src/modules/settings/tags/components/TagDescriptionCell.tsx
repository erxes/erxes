import { TagsListDescriptionField } from '@/settings/tags/components/fields/TagsListDescriptionField';
import { ITag } from 'ui-modules';

export const TagDescriptionCell = ({ tag }: { tag: ITag }) => {
  return (
    <TagsListDescriptionField
      description={tag.description || ''}
      id={tag._id}
    />
  );
};
