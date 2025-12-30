import { TagsListCell } from 'ui-modules/modules/tags-new/components/TagsListCell';
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
  return (
    <TagsListCell className="max-sm:hidden text-sm font-medium">
      {formatDate(createdAt)}
    </TagsListCell>
  );
};
