import { gql, useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { cmsLanguageAtom } from '~/modules/cms/shared/states/cmsLanguageState';
import { CMS_CUSTOM_FIELD_GROUPS } from '../../../../custom-fields/graphql/queries';
import { CONTENT_CMS_LIST } from '../../../../graphql/queries';
import type { FieldGroup } from '../CustomFieldsSection';
import type { IWebsite } from '~/modules/cms/types';

export type PostUrlField = '_id' | 'count' | 'slug';

const COMBINED_CMS_DATA = gql`
  query CombinedCmsData(
    $clientPortalId: String!
    $limit: Int
    $language: String
  ) {
    cmsCategories(clientPortalId: $clientPortalId, limit: $limit) {
      list {
        _id
        name
        parentId
      }
    }
    cmsTags(
      clientPortalId: $clientPortalId
      limit: $limit
      language: $language
    ) {
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

interface IRawCategory {
  _id: string;
  name: string;
  parentId?: string;
}

interface ICategoryOption {
  label: string;
  value: string;
}

interface IRawTag {
  _id: string;
  name: string;
  colorCode?: string;
}

interface ICustomType {
  _id: string;
  code: string;
  label: string;
  description?: string;
}

interface CmsFieldGroup extends FieldGroup {
  customPostTypeIds?: string[];
  enabledPostIds?: string[];
}

interface CombinedCmsData {
  cmsCategories?: {
    list?: IRawCategory[];
  };
  cmsTags?: {
    tags?: IRawTag[];
  };
  cmsCustomPostTypes?: ICustomType[];
}

interface CmsListData {
  contentCMSList?: IWebsite[];
}

interface CustomFieldGroupsData {
  cmsCustomFieldGroupList?: {
    list?: CmsFieldGroup[];
  };
}

const naturalSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

const normalizePostUrlField = (postUrlField?: string): PostUrlField => {
  if (postUrlField === 'count' || postUrlField === 'slug') {
    return postUrlField;
  }

  return '_id';
};

function buildTreeOptions(rawList: IRawCategory[]): ICategoryOption[] {
  const result: ICategoryOption[] = [];
  const visited = new Set<string>();

  const addWithChildren = (cat: IRawCategory, depth: number) => {
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

export const usePostData = (
  websiteId: string,
  selectedType?: string,
  postId?: string,
) => {
  const language = useAtomValue(cmsLanguageAtom);

  const { data: combinedData, loading: combinedLoading } =
    useQuery<CombinedCmsData>(COMBINED_CMS_DATA, {
      variables: { clientPortalId: websiteId || '', limit: 100, language },
      skip: !websiteId,
      fetchPolicy: 'cache-first',
    });

  const { data: cmsData } = useQuery<CmsListData>(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
    skip: !websiteId,
  });

  const { data: fieldGroupsData } = useQuery<CustomFieldGroupsData>(
    CMS_CUSTOM_FIELD_GROUPS,
    {
      variables: { clientPortalId: websiteId },
      skip: !websiteId || !selectedType,
      fetchPolicy: 'cache-first',
    },
  );

  const categories = buildTreeOptions(combinedData?.cmsCategories?.list || []);

  const tags = (combinedData?.cmsTags?.tags || []).map((tag) => ({
    label: tag.name,
    value: tag._id,
  }));

  const customTypes = combinedData?.cmsCustomPostTypes || [];

  const cmsConfig = cmsData?.contentCMSList?.find(
    (cms) => cms.clientPortalId === websiteId,
  );

  const availableLanguages = cmsConfig?.languages || [];
  const defaultLanguage = cmsConfig?.language || 'en';
  const postUrlField = normalizePostUrlField(cmsConfig?.postUrlField);

  const fieldGroups = (
    fieldGroupsData?.cmsCustomFieldGroupList?.list || []
  ).filter((group) => {
    const ids: string[] = group.customPostTypeIds || [];
    if (
      ids.length > 0 &&
      !ids.includes(selectedType || '') &&
      !ids.includes('post')
    ) {
      return false;
    }
    // if specific posts are set, only show for those posts. A new post (no
    // postId yet) can never be in the list, so hide the group while creating.
    const enabledPostIds: string[] = group.enabledPostIds || [];
    if (enabledPostIds.length > 0) {
      return postId ? enabledPostIds.includes(postId) : false;
    }
    return true;
  });

  return {
    categories,
    tags,
    customTypes,
    availableLanguages,
    defaultLanguage,
    postUrlField,
    cmsConfig,
    fieldGroups,
    loading: combinedLoading,
  };
};
