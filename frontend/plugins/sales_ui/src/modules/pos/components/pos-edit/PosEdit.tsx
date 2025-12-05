import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { PosEditSidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { usePosDetail } from '../../hooks/usePosDetail';

interface PosEditProps {
  id?: string;
}

export const PosEdit = ({ id }: PosEditProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posDetail, loading } = usePosDetail(id);

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
      />
    </div>
  );
};
