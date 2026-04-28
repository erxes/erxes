import { TagsListCreatedAtField } from '@/settings/tags/components/fields/TagsListCreatedAtField';
import { ITag } from 'ui-modules';

export const TagDatesCell = ({ tag }: { tag: ITag }) => {
  return <TagsListCreatedAtField createdAt={tag.createdAt || ''} />;
};
