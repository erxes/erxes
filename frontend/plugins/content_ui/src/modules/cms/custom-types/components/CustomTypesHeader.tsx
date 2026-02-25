
import { PageHeader as UIHeader } from 'ui-modules';
import { CustomTypesNavigation } from './CustomTypesNavigation';

export const CustomTypesHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <UIHeader>
      <CustomTypesNavigation />
      <UIHeader.End>{children}</UIHeader.End>
    </UIHeader>
  );
};
