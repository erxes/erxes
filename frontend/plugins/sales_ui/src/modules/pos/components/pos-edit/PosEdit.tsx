import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { PosEditSidebar } from '@/pos/components/pos-edit/Sidebar';
import { MainContent } from '@/pos/components/pos-edit/MainContent';
import { usePosDetail } from '@/pos/hooks/usePosDetail';

interface PosEditProps {
  id?: string;
}

export const PosEdit = ({ id }: PosEditProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posDetail, loading, error } = usePosDetail(id);

  const activeTab = searchParams.get('activeTab') || 'properties';

  useEffect(() => {
    if (!searchParams.get('activeTab')) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('activeTab', 'properties');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex h-full">
      <PosEditSidebar posType={posDetail?.type} activeTab={activeTab} />
      <MainContent
        activeStep={activeTab}
        posId={id}
        posDetail={posDetail}
        loading={loading}
        error={error}
      />
    </div>
  );
};
