import { cn, type IntegrationLogoProps } from 'erxes-ui';
import { logoUrlOf } from './logos';

/** erxes-ui's `IntegrationLogo` for plugin UIs: the logo Settings › Integrations shows. */
export const PluginIntegrationLogo = ({
  integrationKey,
  name,
  className,
}: IntegrationLogoProps) => {
  const url = logoUrlOf(integrationKey);

  if (url) return <img src={url} alt="" className={cn('rounded-sm object-contain', className)} />;

  return (
    <span
      aria-hidden
      className={cn('flex items-center justify-center font-semibold leading-none', className)}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
};
