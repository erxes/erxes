import { IconArrowsRightLeft, TablerIcon } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';

export const AccountingHeader = ({
  children,
  leftChildren,
  favoriteBreadcrumb,
  returnLink,
  returnText,
  icon: Icon = IconArrowsRightLeft,
  skipSettings,
}: {
  children?: React.ReactNode;
  leftChildren?: React.ReactNode;
  favoriteBreadcrumb?: string[];
  returnLink?: string;
  returnText?: string;
  icon?: TablerIcon;
  skipSettings?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const to = returnLink || '/accounting/main';
  const breadcrumb =
    (favoriteBreadcrumb?.length ? favoriteBreadcrumb : undefined) ||
    createFavoriteBreadcrumb(t('accounting'), returnText || t('transactions'));

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={to}>
                  <Icon />
                  {returnText || t('transactions')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{leftChildren}</Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton
          breadcrumb={breadcrumb}
          icon={Icon.displayName}
        />
      </PageHeader.Start>
      <PageHeader.End>{children}</PageHeader.End>
    </PageHeader>
  );
};
