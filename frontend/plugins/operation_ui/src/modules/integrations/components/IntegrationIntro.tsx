import type { ComponentType } from 'react';
import { IntegrationLogo } from './IntegrationLogo';

export const IntegrationIntro = ({
  icon,
  name,
  description,
}: Readonly<{
  icon: ComponentType<{ className?: string }>;
  name: string;
  description: string;
}>) => (
  <div className="flex gap-2">
    <IntegrationLogo icon={icon} />
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className="text-sm font-semibold">{name}</h1>
      <p className="text-sm font-medium text-muted-foreground">{description}</p>
    </div>
  </div>
);
