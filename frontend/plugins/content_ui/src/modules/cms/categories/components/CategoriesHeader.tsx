import { CategoriesNavigation } from './CategoriesNavigation';
import { PageHeader as UIHeader } from 'ui-modules';

export const CategoriesHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <UIHeader>
      <CategoriesNavigation />
      <UIHeader.End>{children}</UIHeader.End>
    </UIHeader>
  );
};
