import { useQuery } from '@apollo/client';
import { CONTENT_CMS_LIST } from '../../../../graphql/queries';
import { CMS_CUSTOM_FIELD_GROUPS } from '../../../../custom-fields/graphql/queries';
import { gql } from '@apollo/client';

const COMBINED_CMS_DATA = gql`
  query CombinedCmsData($clientPortalId: String!, $limit: Int) {
    cmsCategories(clientPortalId: $clientPortalId, limit: $limit) {
      list {
        _id
        name
      }
    }
    cmsTags(clientPortalId: $clientPortalId, limit: $limit) {
      tags {
        _id
        name
        colorCode
      }
    }
    cmsCustomPostTypes(clientPortalId: $clientPortalId) {
      _id
      label
      description
    }
  }
`;

export const usePostData = (websiteId: string, selectedType?: string) => {
  const { data: combinedData, loading: combinedLoading } = useQuery(
    COMBINED_CMS_DATA,
    {
      variables: { clientPortalId: websiteId || '', limit: 100 },
      skip: !websiteId,
      fetchPolicy: 'cache-first',
    },
  );

  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
    skip: !websiteId,
  });

  const { data: fieldGroupsData } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId || !selectedType,
    fetchPolicy: 'cache-first',
  });

  const categories = (combinedData?.cmsCategories?.list || []).map(
    (c: any) => ({
      label: c.name,
      value: c._id,
    }),
  );

  const tags = (combinedData?.cmsTags?.tags || []).map((t: any) => ({
    label: t.name,
    value: t._id,
  }));

  const customTypes = combinedData?.cmsCustomPostTypes || [];

  const cmsConfig = cmsData?.contentCMSList?.find(
    (cms: any) => cms.clientPortalId === websiteId,
  );

  const availableLanguages = cmsConfig?.languages || [];
  const defaultLanguage = cmsConfig?.language || 'en';

  const fieldGroups = (
    fieldGroupsData?.cmsCustomFieldGroupList?.list || []
  ).filter(
    (group: any) =>
      !group.customPostTypeIds ||
      group.customPostTypeIds.length === 0 ||
      group.customPostTypeIds.includes(selectedType),
  );

  return {
    categories,
    tags,
    customTypes,
    availableLanguages,
    defaultLanguage,
    fieldGroups,
    loading: combinedLoading,
  };
};
