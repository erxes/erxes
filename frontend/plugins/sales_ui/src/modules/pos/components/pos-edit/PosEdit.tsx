import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PosEditSidebar } from '@/pos/components/pos-edit/Sidebar';
import { MainContent } from '@/pos/components/pos-edit/MainContent';
import { usePosDetail } from '@/pos/hooks/usePosDetail';

interface PosEditProps {
  id?: string;
  header?: React.ReactNode;
}

export const PosEdit = ({ id, header }: PosEditProps) => {
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
    <div className="flex h-full min-h-0">
      <PosEditSidebar activeTab={activeTab} posId={id} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <div className="flex min-h-0 flex-1">
          <MainContent
            activeStep={activeTab}
            posId={id}
            posDetail={posDetail}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};
