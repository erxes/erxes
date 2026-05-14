import { PageHeader as UIHeader } from 'ui-modules';
import { MenusNavigation } from './MenusNavigation';

export const MenusHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <UIHeader>
      <MenusNavigation />
      <UIHeader.End>{children}</UIHeader.End>
    </UIHeader>
  );
};
