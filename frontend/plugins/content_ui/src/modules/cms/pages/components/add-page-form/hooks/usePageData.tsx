import { useQuery } from '@apollo/client';
import { CONTENT_CMS_LIST } from '~/modules/cms/graphql/queries';

export const usePageData = (websiteId: string) => {
  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
    skip: !websiteId,
  });

  const cmsConfig = cmsData?.contentCMSList?.find(
    (cms: any) => cms.clientPortalId === websiteId,
  );

  const availableLanguages = cmsConfig?.languages || [];
  const defaultLanguage = cmsConfig?.language || 'en';

  return {
    availableLanguages,
    defaultLanguage,
  };
};
