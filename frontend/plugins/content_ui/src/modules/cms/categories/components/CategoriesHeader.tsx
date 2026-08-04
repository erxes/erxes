import { PageHeader as UIHeader } from 'ui-modules';
import { HeaderLanguageTabs } from '@/cms/shared/HeaderLanguageTabs';
import { CategoriesNavigation } from './CategoriesNavigation';

export const CategoriesHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <UIHeader>
      <CategoriesNavigation />
      <UIHeader.End>
        <HeaderLanguageTabs />
        {children}
      </UIHeader.End>
    </UIHeader>
  );
};
