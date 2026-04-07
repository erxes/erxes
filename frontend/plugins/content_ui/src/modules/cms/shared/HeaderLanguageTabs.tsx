import { useEffect } from 'react';
import { Button } from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { CONTENT_CMS_LIST } from '../graphql/queries';
import { useParams } from 'react-router-dom';
import { cmsLanguageAtom } from './states/cmsLanguageState';

interface HeaderLanguageTabsProps {
  onLanguageChange?: (lang: string) => void;
}

export const HeaderLanguageTabs = ({
  onLanguageChange,
}: HeaderLanguageTabsProps = {}) => {
  const { websiteId } = useParams();
  const [selectedLanguage, setSelectedLanguage] = useAtom(cmsLanguageAtom);

  const { data } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
  });

  const cmsConfig = data?.contentCMSList?.find(
    (cms: { clientPortalId?: string }) => cms.clientPortalId === websiteId,
  );

  const availableLanguages: string[] = cmsConfig?.languages || [];
  const defaultLanguage: string = cmsConfig?.language || 'en';

  useEffect(() => {
    if (
      selectedLanguage &&
      availableLanguages.length > 0 &&
      !availableLanguages.includes(selectedLanguage)
    ) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [
    websiteId,
    availableLanguages,
    selectedLanguage,
    defaultLanguage,
    setSelectedLanguage,
  ]);

  if (availableLanguages.length <= 1) return null;

  const activeLanguage = selectedLanguage || defaultLanguage;

  const handleClick = (lang: string) => {
    setSelectedLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  return (
    <div className="inline-flex items-center rounded-md border bg-background p-1 gap-1">
      {availableLanguages.map((lang: string) => (
        <Button
          key={lang}
          type="button"
          variant={activeLanguage === lang ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleClick(lang)}
          className="h-8"
        >
          {lang.toUpperCase()}
        </Button>
      ))}
    </div>
  );
};
