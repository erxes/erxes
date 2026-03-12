import { IconShoppingCartX } from '@tabler/icons-react';
import { EmptyState } from '../../shared/EmptyState';
import { PostsAdd } from './PostsAdd';

/**
 * Props for the PostsEmptyState component
 */
interface PostsEmptyStateProps {
  clientPortalId: string;
}

/**
 * Empty state component displayed when no posts exist
 * Shows a message and button to create the first post
 */
export const PostsEmptyState = ({ clientPortalId }: PostsEmptyStateProps) => {
  return (
    <EmptyState
      icon={IconShoppingCartX}
      title="No post yet"
      description="Get started by creating your first post."
    >
      <PostsAdd clientPortalId={clientPortalId} />
    </EmptyState>
  );
};
