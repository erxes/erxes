import { useQuery } from '@apollo/client';
import { useTags } from '../../../../hooks/useTags';
import { CMS_CATEGORIES, CONTENT_CMS_LIST } from '../../../../graphql/queries';
import { CMS_CUSTOM_FIELD_GROUPS } from '../../../../custom-fields/graphql/queries';
import { CMS_CUSTOM_POST_TYPES } from '../../../../custom-types/graphql/queries';

export const usePostData = (websiteId: string, selectedType?: string) => {
  const { data: catData } = useQuery(CMS_CATEGORIES, {
    variables: { clientPortalId: websiteId || '', limit: 100 },
    skip: !websiteId,
    fetchPolicy: 'cache-first',
  });

  const { tags: tagsData } = useTags({
    clientPortalId: websiteId || '',
    limit: 100,
  });

  const { data: customTypesData } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });

  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
  });

  const { data: fieldGroupsData } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId || !selectedType,
  });

  const categories = (catData?.cmsCategories?.list || []).map((c: any) => ({
    label: c.name,
    value: c._id,
  }));

  const tags = (tagsData || []).map((t: any) => ({
    label: t.name,
    value: t._id,
  }));

  const customTypes = customTypesData?.cmsCustomPostTypes || [];

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
  };
};
