import { Label } from 'erxes-ui';
import { PropsWithChildren } from 'react';

export const SettingsField = ({
  id,
  label,
  required,
  hint,
  children,
}: PropsWithChildren<{
  id?: string;
  label: string;
  required?: boolean;
  hint?: string;
}>) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-[11px]">
      {label}
      {required && <span className="ml-1 text-destructive">*</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const SettingsSectionLabel = ({ children }: PropsWithChildren) => (
  <div className="border-b pb-1 text-[11px] font-semibold uppercase tracking-wide text-primary/70">
    {children}
  </div>
);
