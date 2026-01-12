import React, { createContext, useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, cn, Empty } from 'erxes-ui';
import {
  IconChartHistogram,
  IconGripVertical,
  IconLayoutColumns,
  IconLayoutList,
} from '@tabler/icons-react';

type FrontlineCardContextValue = {
  title?: string;
  description?: string;
  className?: string;
  colSpan: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
};

const FrontlineCardContext = createContext<FrontlineCardContextValue | null>(
  null,
);

function useFrontlineCardContext() {
  const context = useContext(FrontlineCardContext);
  if (!context) {
    throw new Error(
      'FrontlineCard components must be used within FrontlineCard',
    );
  }
  return context;
}

type FrontlineCardRootProps = {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
};

export function FrontlineCardRoot({
  id,
  title,
  description,
  children,
  className,
  colSpan = 2,
  onColSpanChange,
}: FrontlineCardRootProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <FrontlineCardContext.Provider
      value={{
        title,
        description,
        className,
        colSpan,
        onColSpanChange,
        dragHandleProps: {
          ...attributes,
          ...listeners,
        } as React.HTMLAttributes<HTMLButtonElement>,
      }}
    >
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          'w-full border-none h-full bg-sidebar p-3',
          colSpan === 2 ? 'col-span-2' : 'col-span-1',
          isDragging && 'opacity-50 shadow-lg',
          className,
        )}
      >
        {children}
      </Card>
    </FrontlineCardContext.Provider>
  );
}

export function FrontlineCardHeader({ filter }: { filter?: React.ReactNode }) {
  const { title, dragHandleProps, colSpan, onColSpanChange } =
    useFrontlineCardContext();

  const toggleColSpan = () => {
    onColSpanChange?.(colSpan === 2 ? 1 : 2);
  };

  return (
    <Card.Header className="flex items-center justify-between flex-row overflow-x-hidden p-0 pb-2">
      <div className="flex items-center gap-2 flex-1">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
          {...dragHandleProps}
        >
          <IconGripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <Card.Title className="text-sm font-medium font-mono uppercase">
          {title}
        </Card.Title>
      </div>
      <div className="flex items-center gap-2 [&_button]:h-7">
        {filter}
        <button
          type="button"
          onClick={toggleColSpan}
          className="p-1 hover:bg-accent rounded"
          title={
            colSpan === 2 ? 'Switch to half width' : 'Switch to full width'
          }
        >
          {colSpan === 2 ? (
            <IconLayoutColumns className="h-4 w-4 text-muted-foreground" />
          ) : (
            <IconLayoutList className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </Card.Header>
  );
}

export function FrontlineCardEmpty() {
  const { description } = useFrontlineCardContext();
  return (
    <Empty>
      <Empty.Media variant="icon">
        <IconChartHistogram className="size-10" />
      </Empty.Media>
      <Empty.Header>
        <Empty.Title>No data available</Empty.Title>
        <Empty.Description>{description}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
}
type FrontlineCardContentProps = {
  children: React.ReactNode;
};

export function FrontlineCardContent({ children }: FrontlineCardContentProps) {
  return (
    <Card.Content className="bg-background rounded-md p-0">
      {children}
    </Card.Content>
  );
}

export const FrontlineCard = Object.assign(FrontlineCardRoot, {
  Header: FrontlineCardHeader,
  Content: FrontlineCardContent,
  Empty: FrontlineCardEmpty,
});
