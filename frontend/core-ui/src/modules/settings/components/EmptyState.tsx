import React from 'react';
import { Empty } from 'erxes-ui';
import { IconFolderOpen, TablerIcon } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: TablerIcon | React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = IconFolderOpen,
  title,
  description,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center h-[60vh] ${className}`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <Icon className="h-6 w-6 stroke-[1.5] text-muted-foreground" />
      </div>
      {title && (
        <Empty.Title className="text-base md:text-lg font-semibold my-2">
          {title}
        </Empty.Title>
      )}
      {description && (
        <Empty.Content className="mt-1 max-w-md text-sm text-muted-foreground">
          {description}
        </Empty.Content>
      )}
    </div>
  );
}
