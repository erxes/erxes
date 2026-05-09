import * as React from 'react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { Link } from 'react-router-dom';

export type BreadcrumbItemDef = {
  label: string;
  to?: string;
};

export type BreadcrumbBarProps = {
  items: BreadcrumbItemDef[];
};

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({ items }) => (
  <Breadcrumb>
    <Breadcrumb.List className="gap-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <Breadcrumb.Item>
              {item.to ? (
                <Button variant="ghost" asChild>
                  <Link to={item.to}>{item.label}</Link>
                </Button>
              ) : (
                <span className="px-2 text-sm font-medium">{item.label}</span>
              )}
            </Breadcrumb.Item>
            {!isLast && <Separator.Inline />}
          </React.Fragment>
        );
      })}
    </Breadcrumb.List>
  </Breadcrumb>
);
