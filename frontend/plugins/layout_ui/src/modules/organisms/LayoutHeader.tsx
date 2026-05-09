import * as React from 'react';
import { PageHeader } from 'ui-modules';
import { IconLayoutGrid } from '@tabler/icons-react';
import { Heading } from '../atoms/Heading';
import { BreadcrumbBar, BreadcrumbItemDef } from '../molecules/BreadcrumbBar';

export type LayoutHeaderProps = {
  title?: string;
  breadcrumbs?: BreadcrumbItemDef[];
  actions?: React.ReactNode;
};

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({
  title = 'Layout',
  breadcrumbs,
  actions,
}) => (
  <PageHeader>
    <PageHeader.Start>
      {breadcrumbs?.length ? (
        <BreadcrumbBar items={breadcrumbs} />
      ) : (
        <span className="flex items-center gap-2">
          <IconLayoutGrid size={18} />
          <Heading level={4}>{title}</Heading>
        </span>
      )}
    </PageHeader.Start>
    {actions ? <PageHeader.End>{actions}</PageHeader.End> : null}
  </PageHeader>
);
