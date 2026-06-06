import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBranchList } from '@/tms/hooks/BranchList';

export const useBranchDetailPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { branchId } = useParams<{ branchId: string }>();

  const basePath = pathname.includes('/branches/')
    ? pathname.split('/branches/')[0]
    : '/tms';

  const { list, loading: listLoading } = useBranchList();

  const selectedBranch = useMemo(
    () => list.find((branch) => branch._id === branchId),
    [list, branchId],
  );

  const onSelectBranch = (selectedId: string) => {
    const search = new URLSearchParams(window.location.search);
    const query = search.toString();
    navigate(`${basePath}/branches/${selectedId}${query ? `?${query}` : ''}`);
  };

  return {
    branchId,
    basePath,
    list,
    selectedBranch,
    listLoading,
    onSelectBranch,
  };
};
