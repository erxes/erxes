import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { CMS_TAGS } from '../graphql/queries';
import { cmsLanguageAtom } from '../shared/states/cmsLanguageState';

export interface CmsTag {
  _id: string;
  name: string;
  slug: string;
  clientPortalId: string;
  colorCode: string;
  createdAt: string;
  updatedAt?: string;
  translations?: { language: string; title?: string }[];
}

export interface UseTagsProps {
  clientPortalId?: string;
  type?: string;
  searchValue?: string;
  cursor?: string;
  cursorMode?: string;
  direction?: 'forward' | 'backward';
  sortField?: string;
  sortMode?: string;
  sortDirection?: string;
}

interface UseTagsResult {
  tags: CmsTag[];
  loading: boolean;
  error?: any;
  refetch: () => void;
}

export function useTags({
  clientPortalId,
  type,
  searchValue,
  cursor,
  cursorMode,
  direction,
  sortField,
  sortMode,
  sortDirection,
}: UseTagsProps): UseTagsResult {
  const language = useAtomValue(cmsLanguageAtom);

  const { data, loading, error, refetch } = useQuery(CMS_TAGS, {
    variables: {
      clientPortalId,
      type,
      searchValue,
      cursor,
      cursorMode,
      direction,
      sortField,
      sortMode,
      sortDirection,
      language,
    },
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const tags = data?.cmsTags?.tags || [];

  return {
    tags,
    loading,
    error,
    refetch,
  };
}
