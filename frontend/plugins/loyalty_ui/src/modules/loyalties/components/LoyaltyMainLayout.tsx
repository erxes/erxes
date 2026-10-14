import { Breadcrumb, Button, PageContainer, Separator } from 'erxes-ui';
import { Suspense } from 'react';
import { IconAward } from '@tabler/icons-react';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import {
  LoyaltyHeaderActionProvider,
  useLoyaltyHeaderAction,
} from '@/loyalties/components/LoyaltyHeaderActionContext';

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
    accounts: 'loyalty-accounts',
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
        <PageHeader>
          <PageHeader.Start>
            <Breadcrumb>
              <Breadcrumb.List className="gap-1">
                <Breadcrumb.Item>
                  <Button
                    variant="ghost"
                    asChild
                    className="cursor-default hover:bg-transparent"
                  >
                    <span>
                      <IconAward />
                      {t('loyalty-title')}
                    </span>
                  </Button>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb>
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
          <Suspense>{children}</Suspense>
        </div>
      </PageContainer>
    </LoyaltyHeaderActionProvider>
  );
};
