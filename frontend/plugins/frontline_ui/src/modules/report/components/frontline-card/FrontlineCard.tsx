import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, cn, Empty, Skeleton } from 'erxes-ui';
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
  colSpan: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
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
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
};

export function FrontlineCardRoot({
  id,
  title,
  description,
  children,
  className,
  colSpan = 6,
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
        style={{
          ...style,
          boxShadow: 'var(--shadow-card)',
        }}
        className={cn(
          'w-full h-full bg-card border rounded-xl p-5 flex flex-col',
          colSpan === 6 ? 'col-span-6' : 'col-span-12',
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
  const { t } = useTranslation('frontline');
  const { title, dragHandleProps, colSpan, onColSpanChange } =
    useFrontlineCardContext();

  const toggleColSpan = () => {
    onColSpanChange?.(colSpan === 6 ? 12 : 6);
  };

  return (
    <Card.Header className="flex items-center justify-between flex-row overflow-x-hidden p-0 pt-1 pb-3 flex-none">
      {/* Accent bar + title — matches SectionCard style */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-accent rounded shrink-0"
          {...dragHandleProps}
        >
          <IconGripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="h-4 w-1 rounded-full bg-(--primary) shrink-0" />
        <Card.Title className="text-sm font-semibold leading-tight truncate">
          {title}
        </Card.Title>
      </div>

      <div className="flex items-center gap-1 shrink-0 [&_button]:h-7">
        {filter}
        <button
          type="button"
          onClick={toggleColSpan}
          className="p-1 hover:bg-accent rounded"
          title={
            colSpan === 6 ? t('expand-to-full-width') : t('collapse-to-half-width')
          }
        >
          {colSpan === 6 ? (
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
  const { t } = useTranslation('frontline');
  const { description } = useFrontlineCardContext();
  return (
    <Empty>
      <Empty.Media variant="icon">
        <IconChartHistogram className="size-10" />
      </Empty.Media>
      <Empty.Header>
        <Empty.Title>{t('no-data-available')}</Empty.Title>
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
    <Card.Content className="rounded-md p-0 flex-1 min-h-0 flex flex-col">
      {children}
    </Card.Content>
  );
}

export function FrontlineCardSkeleton() {
  return (
    <Card.Content className="rounded-md p-0 flex-1">
      <div className="rounded-lg bg-muted/30 animate-pulse w-full h-48" />
    </Card.Content>
  );
}

export const FrontlineCard = Object.assign(FrontlineCardRoot, {
  Header: FrontlineCardHeader,
  Content: FrontlineCardContent,
  Empty: FrontlineCardEmpty,
  Skeleton: FrontlineCardSkeleton,
});
