import { gql, useQuery } from '@apollo/client';
import { CMS_CUSTOM_FIELD_GROUPS } from '../../../../custom-fields/graphql/queries';
import { CONTENT_CMS_LIST } from '../../../../graphql/queries';

const COMBINED_CMS_DATA = gql`
  query CombinedCmsData($clientPortalId: String!, $limit: Int) {
    cmsCategories(clientPortalId: $clientPortalId, limit: $limit) {
      list {
        _id
        name
        parentId
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
      code
      label
      description
    }
  }
`;

interface RawCategory {
  _id: string;
  name: string;
  parentId?: string;
}

interface CategoryOption {
  label: string;
  value: string;
}

const naturalSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function buildTreeOptions(rawList: RawCategory[]): CategoryOption[] {
  const result: CategoryOption[] = [];
  const visited = new Set<string>();

  const addWithChildren = (cat: RawCategory, depth: number) => {
    if (visited.has(cat._id)) return;
    visited.add(cat._id);
    const prefix = depth > 0 ? '-'.repeat(depth) + ' ' : '';
    result.push({ label: prefix + cat.name, value: cat._id });
    rawList
      .filter((c) => c.parentId === cat._id)
      .sort((a, b) => naturalSort(a.name, b.name))
      .forEach((child) => addWithChildren(child, depth + 1));
  };

  rawList
    .filter((c) => !c.parentId)
    .sort((a, b) => naturalSort(a.name, b.name))
    .forEach((root) => addWithChildren(root, 0));

  rawList.forEach((c) => {
    if (!visited.has(c._id)) {
      result.push({ label: c.name, value: c._id });
    }
  });

  return result;
}

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

  const categories = buildTreeOptions(
    combinedData?.cmsCategories?.list || [],
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
