import { ReactNode } from 'react';

export const AdjustDetailField = ({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="truncate text-sm font-medium">{value || '-'}</div>
  </div>
);
