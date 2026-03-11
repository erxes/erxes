import { PagesNavigation } from './PagesNavigation';
import { PageHeader } from 'ui-modules';

export const PagesHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <PageHeader>
      <PagesNavigation />
      <PageHeader.End>{children}</PageHeader.End>
    </PageHeader>
  );
};
