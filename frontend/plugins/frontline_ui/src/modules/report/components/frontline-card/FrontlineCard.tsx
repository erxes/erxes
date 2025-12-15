import React, { createContext, useContext } from 'react';
import { Card, cn } from 'erxes-ui';

type FrontlineCardContextValue = {
  title?: string;
  description?: string;
  className?: string;
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
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

export function FrontlineCardRoot({
  title,
  description,
  children,
  className,
}: FrontlineCardRootProps) {
  return (
    <FrontlineCardContext.Provider value={{ title, description, className }}>
      <Card className={cn('w-full border-border border', className)}>
        {children}
      </Card>
    </FrontlineCardContext.Provider>
  );
}

export function FrontlineCardHeader({ filter }: { filter?: React.ReactNode }) {
  const { title } = useFrontlineCardContext();

  return (
    <Card.Header className="flex items-center justify-between flex-row overflow-x-hidden">
      <Card.Title className="flex-1">{title}</Card.Title>
      {filter}
    </Card.Header>
  );
}

type FrontlineCardContentProps = {
  children: React.ReactNode;
};

export function FrontlineCardContent({ children }: FrontlineCardContentProps) {
  return <Card.Content>{children}</Card.Content>;
}

export const FrontlineCard = Object.assign(FrontlineCardRoot, {
  Header: FrontlineCardHeader,
  Content: FrontlineCardContent,
});
