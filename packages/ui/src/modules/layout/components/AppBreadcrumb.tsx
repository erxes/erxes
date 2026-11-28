import { Breadcrumb } from 'erxes-ui/components/breadcrumb';
import { buttonVariants } from 'erxes-ui/components/button';
import { type ComponentType, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';

/** One level of the page's place. Without `to` it links to the page it is on. */
export interface Crumb {
  label: string;
  to?: string;
  icon?: ComponentType<{ className?: string }>;
}

/**
 * The page's trail: the app's icon and name, then each level, as links.
 * It goes in a `PageHeader.Start`; the last level is the page. Core and every plugin use it.
 */
export const AppBreadcrumb = ({ items }: { items: Crumb[] }) => {
  const { pathname } = useLocation();

  return (
    <Breadcrumb>
      <Breadcrumb.List>
        {items.map((item, index) => {
          const Icon = item.icon;

          const link = (
            <Link to={item.to ?? pathname} className={buttonVariants({ variant: 'ghost' })}>
              {Icon && <Icon />}
              {item.label}
            </Link>
          );

          return (
            <Fragment key={`${item.to ?? ''}:${item.label}`}>
              {index > 0 && <Breadcrumb.Separator />}
              <Breadcrumb.Item>
                {index === items.length - 1 ? <Breadcrumb.Page>{link}</Breadcrumb.Page> : link}
              </Breadcrumb.Item>
            </Fragment>
          );
        })}
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
