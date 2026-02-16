import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { ReactNode } from 'react';

interface GenericHeaderProps {
  icon: ReactNode;
  parentIcon?: ReactNode;
  parentLabel: string;
  parentLink: string;
  currentLabel: string;
  actions?: ReactNode;
}

export const GenericHeader = ({
  icon,
  parentIcon,
  parentLabel,
  parentLink,
  currentLabel,
  actions,
}: GenericHeaderProps) => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={parentLink}>
                  {parentIcon || icon}
                  {parentLabel}
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Button variant="ghost">
                {icon}
                {currentLabel}
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
      {actions && <PageHeader.End>{actions}</PageHeader.End>}
    </PageHeader>
  );
};
