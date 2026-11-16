import { cn } from 'erxes-ui';

interface PosSettingsSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  separated?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const PosSettingsSection = ({
  title,
  description,
  separated,
  className,
  children,
}: PosSettingsSectionProps) => (
  <section className={cn('space-y-4', separated && 'border-t pt-8', className)}>
    <div className="space-y-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </section>
);
