import { ComponentType } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  loading?: boolean;
}

export function MetricCard({ label, value, icon: Icon, loading }: MetricCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2 bg-card">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-muted animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-semibold">{value}</p>
      )}
    </div>
  );
}
