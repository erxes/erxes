import { CustomFieldsNavigation } from './CustomFieldsNavigation';
import { PageHeader as UIHeader } from 'ui-modules';

export const CustomFieldsHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <UIHeader>
      <CustomFieldsNavigation />
      <UIHeader.End>{children}</UIHeader.End>
    </UIHeader>
  );
};
