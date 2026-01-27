import { IconArrowsRightLeft, IconSettings } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';

export const AccountingHeader = ({
  children,
  leftChildren,
  returnLink,
  returnText,
}: {
  children?: React.ReactNode;
  leftChildren?: React.ReactNode;
  returnLink?: string;
  returnText?: string;
}) => {
  const to = returnLink || "/accounting/main"
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={to}>
                  <IconArrowsRightLeft />
                  {`${returnText || 'Transactions'}`}
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {leftChildren}
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
      <PageHeader.End>
        <Button variant="outline" asChild>
          <Link to="/settings/accounting">
            <IconSettings />
            Go to settings
          </Link>
        </Button>
        {children}
      </PageHeader.End>
    </PageHeader>
  );
};
