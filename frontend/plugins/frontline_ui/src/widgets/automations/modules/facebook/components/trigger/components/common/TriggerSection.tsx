import { ReactNode } from 'react';

export const TriggerSection = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2 p-4">
      {title ? (
        <p className="font-semibold text-sm text-muted-foreground">{title}</p>
      ) : null}
      {children}
    </div>
  );
};
