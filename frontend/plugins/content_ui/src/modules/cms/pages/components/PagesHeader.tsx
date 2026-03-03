import { PagesNavigation } from './PagesNavigation';
import { PageHeader as UIHeader } from 'ui-modules';

export const PagesHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <UIHeader>
      <PagesNavigation />
      <UIHeader.End>{children}</UIHeader.End>
    </UIHeader>
  );
};
