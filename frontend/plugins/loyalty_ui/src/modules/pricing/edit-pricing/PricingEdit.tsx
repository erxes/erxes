import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { PricingEditSidebar } from '@/pricing/edit-pricing/Sidebar';
import { PricingMainContent } from '@/pricing/edit-pricing/MainContent';
import { usePricingDetail } from '@/pricing/hooks/usePricingDetail';

interface PricingEditProps {
  id?: string;
}

export const PricingEdit = ({ id }: PricingEditProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pricingDetail, loading, error } = usePricingDetail(id);

  const activeTab = searchParams.get('activeTab') || 'general';

  useEffect(() => {
    if (!searchParams.get('activeTab')) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('activeTab', 'general');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex h-full">
      <PricingEditSidebar activeTab={activeTab} />

      <PricingMainContent
        activeStep={activeTab}
        pricingId={id}
        pricingDetail={pricingDetail}
        loading={loading}
        error={error}
      />
    </div>
  );
};
