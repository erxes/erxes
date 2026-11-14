import { Breadcrumb, buttonVariants } from 'erxes-ui';
import { type ComponentType, Fragment } from 'react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to: string;
  icon?: ComponentType<{ className?: string }>;
}

/** Page breadcrumb: app, then the section, as ghost links. */
export const AppBreadcrumb = ({ items }: { items: Crumb[] }) => (
  <>
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        {items.map((item, index) => {
          const Icon = item.icon;

          const link = (
            <Link to={item.to} className={buttonVariants({ variant: 'ghost' })}>
              {Icon && <Icon />}
              {item.label}
            </Link>
          );

          return (
            <Fragment key={item.to}>
              {index > 0 && <Breadcrumb.Separator />}
              <Breadcrumb.Item>
                {index === items.length - 1 ? <Breadcrumb.Page>{link}</Breadcrumb.Page> : link}
              </Breadcrumb.Item>
            </Fragment>
          );
        })}
      </Breadcrumb.List>
    </Breadcrumb>
  </>
);
