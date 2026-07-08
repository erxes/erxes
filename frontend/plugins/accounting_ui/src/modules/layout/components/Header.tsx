import { IconArrowsRightLeft, IconSettings } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';

export const AccountingHeader = ({
  children,
  leftChildren,
  returnLink,
  returnText,
  skipSettings,
}: {
  children?: React.ReactNode;
  leftChildren?: React.ReactNode;
  returnLink?: string;
  returnText?: string;
  skipSettings?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const to = returnLink || '/accounting/main';
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={to}>
                  <IconArrowsRightLeft />
                  {returnText || t('transactions')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{leftChildren}</Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
      <PageHeader.End>
        {!skipSettings && (
          <Button variant="outline" asChild>
            <Link to="/settings/accounting">
              <IconSettings />
              {t('go-to-settings')}
            </Link>
          </Button>
        )}
        {children}
      </PageHeader.End>
    </PageHeader>
  );
};
