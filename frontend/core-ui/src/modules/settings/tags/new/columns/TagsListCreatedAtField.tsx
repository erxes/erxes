import { TagsListCell } from '../TagsListCell';
export const TagsListCreatedAtField = ({
  createdAt,
}: {
  createdAt: string;
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  return <TagsListCell className='max-sm:hidden'>{formatDate(createdAt)}</TagsListCell>;
};
