import type { ReactNode } from 'react';

/** A count after its icon, such as the people in a unit; `title` says what is counted. */
export const IconCount = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: number;
}) => (
  <span className="flex shrink-0 items-center gap-1 tabular-nums" title={title}>
    {icon}
    {children}
  </span>
);
