import { useEffect, useState } from 'react';
import { IconCoins } from '@tabler/icons-react';
import { Badge, Breadcrumb, Button, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { PricingEditSidebar } from '@/pricing/edit-pricing/Sidebar';
import { PricingMainContent } from '@/pricing/edit-pricing/MainContent';
import { PricingHeaderActionPortalProvider } from '@/pricing/edit-pricing/PricingHeaderActionPortalContext';
import { usePricingDetail } from '@/pricing/hooks/usePricingDetail';

interface PricingEditProps {
  id?: string;
}

export const PricingEdit = ({ id }: PricingEditProps) => {
  const { t } = useTranslation('loyalty');
  const [searchParams, setSearchParams] = useSearchParams();
  const [headerActionPortal, setHeaderActionPortal] =
    useState<HTMLDivElement | null>(null);
  const { pricingDetail, loading, error } = usePricingDetail(id);

  const requestedActiveTab = searchParams.get('activeTab') || 'general';
  const normalizedActiveTab =
    requestedActiveTab === 'rules' ? 'common' : requestedActiveTab;
  const shouldHideParticipants = pricingDetail?.priority === 'posBase';
  const activeTab =
    shouldHideParticipants && normalizedActiveTab === 'participants'
      ? 'general'
      : normalizedActiveTab;

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

    if (activeTabParam === 'rules') {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set('activeTab', 'common');
          return newParams;
        },
        { replace: true },
      );

      return;
    }

    if (
      pricingDetail?.priority === 'posBase' &&
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
    <div className="flex h-full flex-col">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/loyalty/pricing">
                    <IconCoins />
                    {t('pricing')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                {loading ? (
                  <Skeleton className="mx-3 h-4 w-20 bg-border" />
                ) : (
                  <div className="flex min-w-0 items-center gap-2 px-3">
                    <span className="max-w-64 truncate font-medium">
                      {pricingDetail?.name || t('new-pricing')}
                    </span>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {pricingDetail?.applyType || t('na')}
                    </Badge>
                  </div>
                )}
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <div ref={setHeaderActionPortal} />
        </PageHeader.End>
      </PageHeader>

      <PricingHeaderActionPortalProvider target={headerActionPortal}>
        <div className="flex min-h-0 flex-1">
          <PricingEditSidebar
            activeTab={activeTab}
            pricingDetail={pricingDetail}
          />

          <PricingMainContent
            activeStep={activeTab}
            pricingId={id}
            pricingDetail={pricingDetail}
            loading={loading}
            error={error}
          />
        </div>
      </PricingHeaderActionPortalProvider>
    </div>
  );
};
