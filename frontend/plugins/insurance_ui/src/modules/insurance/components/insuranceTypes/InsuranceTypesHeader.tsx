import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconSandbox, IconShieldCheck, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';

interface InsuranceTypesHeaderProps {
  onCreateClick?: () => void;
}

export const InsuranceTypesHeader = ({
  onCreateClick,
}: InsuranceTypesHeaderProps) => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/insurance/products">
                  <IconSandbox />
                  Insurance
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Button variant="ghost">
                <IconShieldCheck />
                Insurance Types
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
      <PageHeader.End>
        <Button onClick={onCreateClick}>
          <IconPlus size={16} />
          New Insurance Type
        </Button>
      </PageHeader.End>
    </PageHeader>
  );
};
