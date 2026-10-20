import { gql } from '~/gql';
import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { cmsLanguageAtom } from '~/modules/cms/shared/states/cmsLanguageState';
import { compactList } from '~/modules/cms/shared/utils';
import { CMS_CUSTOM_FIELD_GROUPS } from '../../../../custom-fields/graphql/queries';
import { toFieldDefinitions } from '../../../../custom-fields/utils/toFieldDefinitions';
import { CONTENT_CMS_LIST } from '../../../../graphql/queries';
import type { FieldGroup } from '../CustomFieldsSection';

export type PostUrlField = '_id' | 'count' | 'slug';

const COMBINED_CMS_DATA = gql(`
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
`);

interface IRawCategory {
  _id: string;
  name: string | null;
  parentId?: string | null;
}

interface ICategoryOption {
  label: string;
  value: string;
}

const naturalSort = (a: string | null, b: string | null) =>
  (a ?? '').localeCompare(b ?? '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });

const normalizePostUrlField = (postUrlField?: string | null): PostUrlField => {
  if (postUrlField === 'count' || postUrlField === 'slug') {
    return postUrlField;
  }

  return '_id';
};

function buildTreeOptions(rawList: IRawCategory[]): ICategoryOption[] {
  const result: ICategoryOption[] = [];
  const visited = new Set<string>();

  const addWithChildren = (cat: IRawCategory, ancestors: string[]) => {
    if (visited.has(cat._id)) return;
    visited.add(cat._id);
    const path = [...ancestors, cat.name ?? ''];
    result.push({ label: path.join(' / '), value: cat._id });
    rawList
      .filter((c) => c.parentId === cat._id)
      .sort((a, b) => naturalSort(a.name, b.name))
      .forEach((child) => addWithChildren(child, path));
  };

  rawList
    .filter((c) => !c.parentId)
    .sort((a, b) => naturalSort(a.name, b.name))
    .forEach((root) => addWithChildren(root, []));

  rawList.forEach((c) => {
    if (!visited.has(c._id)) {
      result.push({ label: c.name ?? '', value: c._id });
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

  const { data: combinedData, loading: combinedLoading } = useQuery(
    COMBINED_CMS_DATA,
    {
      variables: { clientPortalId: websiteId || '', limit: 100, language },
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
    compactList(combinedData?.cmsCategories?.list),
  );

  const tags = compactList(combinedData?.cmsTags?.tags).map((tag) => ({
    label: tag.name ?? '',
    value: tag._id,
  }));

  const customTypes = useMemo(
    () => compactList(combinedData?.cmsCustomPostTypes),
    [combinedData?.cmsCustomPostTypes],
  );

  const cmsConfig = useMemo(
    () =>
      compactList(cmsData?.contentCMSList).find(
        (cms) => cms.clientPortalId === websiteId,
      ),
    [cmsData?.contentCMSList, websiteId],
  );

  const availableLanguages = useMemo(
    () => compactList(cmsConfig?.languages),
    [cmsConfig?.languages],
  );
  const defaultLanguage = cmsConfig?.language || 'en';
  const postUrlField = normalizePostUrlField(cmsConfig?.postUrlField);

  const fieldGroupList = useMemo(
    () =>
      compactList(fieldGroupsData?.cmsCustomFieldGroupList?.list).map(
        (group) => ({
          _id: group._id,
          label: group.label,
          customPostTypeIds: compactList(group.customPostTypeIds),
          enabledPostIds: compactList(group.enabledPostIds),
          fields: toFieldDefinitions(group.fields),
        }),
      ),
    [fieldGroupsData],
  );

  const fieldGroups: FieldGroup[] = fieldGroupList.filter((group) => {
    const ids: string[] = group.customPostTypeIds;
    if (
      ids.length > 0 &&
      !ids.includes(selectedType || '') &&
      !ids.includes('post')
    ) {
      return false;
    }
    // if specific posts are set, only show for those posts. A new post (no
    // postId yet) can never be in the list, so hide the group while creating.
    const enabledPostIds: string[] = group.enabledPostIds;
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
