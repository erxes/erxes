
import { PageHeader as UIHeader } from 'ui-modules';
import { CategoriesNavigation } from './CategoriesNavigation';

export const CategoriesHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <UIHeader>
      <CategoriesNavigation />
      <UIHeader.End>{children}</UIHeader.End>
    </UIHeader>
  );
};
