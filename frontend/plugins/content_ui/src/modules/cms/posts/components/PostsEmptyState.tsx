import { IconShoppingCartX } from '@tabler/icons-react';
import { PostsAdd } from './PostsAdd';

interface PostsEmptyStateProps {
  clientPortalId: string;
}

export const PostsEmptyState = ({ clientPortalId }: PostsEmptyStateProps) => {
  return (
    <div className="flex justify-center px-8 w-full h-full">
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="mb-6">
          <IconShoppingCartX
            size={64}
            className="mx-auto mb-4 text-muted-foreground"
          />
          <h3 className="mb-2 text-xl font-semibold">No post yet</h3>
          <p className="max-w-md text-muted-foreground">
            Get started by creating your first post.
          </p>
        </div>
        <PostsAdd clientPortalId={clientPortalId} />
      </div>
    </div>
  );
};
