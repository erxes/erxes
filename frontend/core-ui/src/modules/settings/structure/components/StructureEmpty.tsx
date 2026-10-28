import { TablerIcon } from '@tabler/icons-react';
import { cn, Empty } from 'erxes-ui';
import { ReactNode } from 'react';

export const StructureEmpty = ({
  icon: Icon,
  title,
  description,
  className,
  children,
}: {
  icon: TablerIcon;
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}) => (
  <Empty className={cn('md:p-8', className)}>
    <Empty.Header>
      <Empty.Media variant="icon">
        <Icon />
      </Empty.Media>
      <Empty.Title className="text-base">{title}</Empty.Title>
      {description && <Empty.Description>{description}</Empty.Description>}
    </Empty.Header>
    {children}
  </Empty>
);
