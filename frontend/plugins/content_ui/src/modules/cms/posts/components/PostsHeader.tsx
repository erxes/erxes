import { PostsNavigation } from './PostsNavigation';
import { PageHeader } from 'ui-modules';

export const PostsHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <PageHeader>
      <PostsNavigation />
      <PageHeader.End>{children}</PageHeader.End>
    </PageHeader>
  );
};
