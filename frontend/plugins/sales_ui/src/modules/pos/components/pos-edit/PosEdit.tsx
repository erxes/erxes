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
  const { posDetail } = usePosDetail(id);

  const activeTab = searchParams.get('activeTab') || 'properties';

  useEffect(() => {
    if (!searchParams.get('activeTab')) {
      setSearchParams({ activeTab: 'properties' });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex h-full">
      <PosEditSidebar posType={posDetail?.type} activeTab={activeTab} />
      <MainContent activeStep={activeTab} posId={id} />
    </div>
  );
};
