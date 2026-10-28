import { useMultiQueryState } from 'erxes-ui';

export const useTeamMemberFilters = () => {
  const [
    { searchValue, brandIds, entityIds, isActive, status, segment, excludeIds },
  ] = useMultiQueryState<{
    searchValue: string;
    brandIds: string[];
    entityIds: string[];
    isActive: boolean;
    status: string;
    segment: string;
    excludeIds: string;
  }>([
    'searchValue',
    'brandIds',
    'entityIds',
    'isActive',
    'status',
    'segment',
    'excludeIds',
  ]);

  const parsedExcludeIds = excludeIds?.split(',').filter(Boolean);

  return {
    searchValue: searchValue || undefined,
    brandIds: brandIds?.length ? brandIds : undefined,
    entityIds: entityIds?.length ? entityIds : undefined,
    isActive: isActive ?? undefined,
    status: status || undefined,
    segment: segment || undefined,
    excludeIds: parsedExcludeIds?.length ? parsedExcludeIds : undefined,
  };
};
