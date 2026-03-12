import { IconArrowLeft, IconBox } from '@tabler/icons-react';
import { useBranchDetailPage } from '@/tms/branch-detail/hooks/useBranchDetailPage';
import { Button, Spinner } from 'erxes-ui';
import { useSearchParams } from 'react-router';
import { useEffect } from 'react';
import { MainContent, BranchSideBar } from '@/tms/branch-detail/components';

export const BranchDetailView = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('activeTab') || 'tour';

  useEffect(() => {
    if (!searchParams.get('activeTab')) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('activeTab', 'tour');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  const { selectedBranch, listLoading } = useBranchDetailPage();

  if (listLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner />
      </div>
    );
  }

  if (!selectedBranch) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
        <IconBox size={64} stroke={1.5} className="text-muted-foreground" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Branch not found
          </h2>

          <Button variant="outline" onClick={() => window.history.back()}>
            <IconArrowLeft size={16} />
            Back to branches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <BranchSideBar activeTab={activeTab} />
      <MainContent activeStep={activeTab} branch={selectedBranch} />
    </div>
  );
};
