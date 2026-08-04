import { useAtomValue } from 'jotai';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { cmsLanguageAtom } from '../states/cmsLanguageState';
import { CONTENT_CMS_LIST } from '../../graphql/queries';

export const useIsTranslationMissing = () => {
  const { websiteId } = useParams();
  const selectedLanguage = useAtomValue(cmsLanguageAtom);

  const { data } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
  });

  const cmsConfig = data?.contentCMSList?.find(
    (cms: { clientPortalId?: string }) => cms.clientPortalId === websiteId,
  );

  const defaultLanguage: string = cmsConfig?.language || 'en';
  const isNonDefaultLanguage =
    !!selectedLanguage && selectedLanguage !== defaultLanguage;

  const isMissing = (translations?: { language: string }[]) => {
    if (!isNonDefaultLanguage) return false;
    if (!translations || translations.length === 0) return true;
    return !translations.some((t) => t.language === selectedLanguage);
  };

  return { isMissing, isNonDefaultLanguage };
};
