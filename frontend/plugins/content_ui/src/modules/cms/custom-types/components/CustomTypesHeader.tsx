import { CustomTypesNavigation } from './CustomTypesNavigation';
import { PageHeader as UIHeader } from 'ui-modules';

export const CustomTypesHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <UIHeader>
      <CustomTypesNavigation />
      <UIHeader.End>{children}</UIHeader.End>
    </UIHeader>
  );
};
