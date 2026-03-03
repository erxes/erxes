import { TagsNavigation } from './TagsNavigation';
import { PageHeader as UIHeader } from 'ui-modules';

export const TagsHeader = ({ children }: React.PropsWithChildren) => {
  return (
    <UIHeader>
      <TagsNavigation />
      <UIHeader.End>{children}</UIHeader.End>
    </UIHeader>
  );
};
