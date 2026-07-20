import { PageContainer, Separator } from 'erxes-ui';
import { Suspense } from 'react';
import { IconAward } from '@tabler/icons-react';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { LoyaltyMainSidebar } from './LoyaltyMainSidebar';
import {
  LoyaltyHeaderActionProvider,
  useLoyaltyHeaderAction,
} from './LoyaltyHeaderActionContext';

const LoyaltyHeaderEnd = () => {
  const { action } = useLoyaltyHeaderAction();
  return <>{action}</>;
};

export const LoyaltyMainLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('loyalty');
  const { pathname } = useLocation();
  const sectionLabelByPath: Record<string, string> = {
    vouchers: 'vouchers',
    lotteries: 'lotteries',
    spins: 'spins',
    donates: 'donates',
    scores: 'scores',
    assignments: 'assignments',
    agents: 'agents',
    coupons: 'coupons',
  };
  const currentSection = pathname
    .split('/')
    .reduce((lastSection, section) => section || lastSection, '');
  const currentLabel = sectionLabelByPath[currentSection]
    ? t(sectionLabelByPath[currentSection])
    : '';
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    t('loyalty-title'),
    currentLabel,
  );

  return (
    <LoyaltyHeaderActionProvider>
      <PageContainer className="flex flex-col h-full">
        <PageHeader className="p-3 mx-0">
          <PageHeader.Start>
            <IconAward className="size-4" />
            <span className="font-medium">{t('loyalty-title')}</span>
            <Separator.Inline />
            <PageHeader.FavoriteToggleButton
              breadcrumb={favoriteBreadcrumb}
              icon="IconAward"
            />
          </PageHeader.Start>
          <PageHeader.End>
            <LoyaltyHeaderEnd />
          </PageHeader.End>
        </PageHeader>
        <div className="flex flex-row h-full overflow-hidden">
          <LoyaltyMainSidebar />
          <div className="flex flex-col flex-auto overflow-hidden">
            <Suspense>{children}</Suspense>
          </div>
        </div>
      </PageContainer>
    </LoyaltyHeaderActionProvider>
  );
};
