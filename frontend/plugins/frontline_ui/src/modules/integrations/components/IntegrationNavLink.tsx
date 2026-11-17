import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { getPluginAssetsUrl, NavigationMenuLinkItem } from 'erxes-ui';
import type { ReactNode } from 'react';

export const IntegrationNavLink = ({
  basePath,
  path,
  name,
  img,
  children,
}: {
  basePath: string;
  path: string;
  name: string;
  img: string;
  children?: ReactNode;
}) => (
  <NavigationMenuLinkItem
    pathPrefix={basePath}
    path={path}
    name={name}
    label={
      <>
        <IntegrationLogo
          img={getPluginAssetsUrl('frontline', img)}
          name={name}
          className="size-5 shrink-0 rounded-sm p-0.5"
        />
        <span className="min-w-0 flex-1 truncate">{name}</span>
      </>
    }
  >
    {children}
  </NavigationMenuLinkItem>
);
