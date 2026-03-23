import { PageHeader } from 'ui-modules';

export const ProductsHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <PageHeader>
      <PageHeader.End>{children}</PageHeader.End>
    </PageHeader>
  );
};
