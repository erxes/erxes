import { useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PricingEditSidebar } from '@/pricing/edit-pricing/Sidebar';
import { PricingMainContent } from '@/pricing/edit-pricing/MainContent';
import { usePricingDetail } from '@/pricing/hooks/usePricingDetail';

interface PricingEditProps {
  id?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
  header?: ReactNode;
}

export const PricingEdit = ({
  id,
  onSaveActionChange,
  header,
}: PricingEditProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pricingDetail, loading, error } = usePricingDetail(id);

  const requestedActiveTab = searchParams.get('activeTab') || 'general';
  const shouldHideParticipants =
    pricingDetail?.priority === 'posBase' ||
    pricingDetail?.priority === 'pipelineBase';
  const activeTab =
    shouldHideParticipants && requestedActiveTab === 'participants'
      ? 'general'
      : requestedActiveTab;

  useEffect(() => {
    const activeTabParam = searchParams.get('activeTab');

    if (!activeTabParam) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('activeTab', 'general');
        return newParams;
      });

      return;
    }

    if (
      (pricingDetail?.priority === 'posBase' ||
        pricingDetail?.priority === 'pipelineBase') &&
      activeTabParam === 'participants'
    ) {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set('activeTab', 'general');
          return newParams;
        },
        { replace: true },
      );
    }
  }, [pricingDetail?.priority, searchParams, setSearchParams]);

  return (
    <div className="flex h-full">
      <PricingEditSidebar activeTab={activeTab} pricingDetail={pricingDetail} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <div className="flex min-h-0 flex-1">
          <PricingMainContent
            activeStep={activeTab}
            pricingId={id}
            pricingDetail={pricingDetail}
            loading={loading}
            error={error}
            onSaveActionChange={onSaveActionChange}
          />
        </div>
      </div>
    </div>
  );
};
