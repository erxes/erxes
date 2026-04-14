import { PagesNavigation } from './PagesNavigation';
import { PageHeader } from 'ui-modules';
import { HeaderLanguageTabs } from '../../shared/HeaderLanguageTabs';

interface PagesHeaderProps {
  onLanguageChange?: (lang: string) => void;
}

export const PagesHeader = ({
  children,
  onLanguageChange,
}: React.PropsWithChildren<PagesHeaderProps>) => {
  return (
    <PageHeader>
      <PagesNavigation />
      <PageHeader.End>
        <HeaderLanguageTabs onLanguageChange={onLanguageChange} />
        {children}
      </PageHeader.End>
    </PageHeader>
  );
};
