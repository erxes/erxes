import { PostsNavigation } from './PostsNavigation';
import { PageHeader } from 'ui-modules';
import { HeaderLanguageTabs } from '../../shared/HeaderLanguageTabs';

interface PostsHeaderProps {
  onLanguageChange?: (lang: string) => void;
}

export const PostsHeader = ({
  children,
  onLanguageChange,
}: React.PropsWithChildren<PostsHeaderProps>) => {
  return (
    <PageHeader>
      <PostsNavigation />
      <PageHeader.End>
        <HeaderLanguageTabs onLanguageChange={onLanguageChange} />
        {children}
      </PageHeader.End>
    </PageHeader>
  );
};
