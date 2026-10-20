import { createContext, useContext } from 'react';

export type TPropertiesScope = {
  /** Route base of the properties pages, e.g. `/settings/properties`. */
  basePath: string;
  /** Only this plugin's property types; all types when unset. */
  pluginName?: string;
};

export const ORGANIZATION_PROPERTIES_SCOPE: TPropertiesScope = {
  basePath: '/settings/properties',
};

/**
 * Lets the same properties pages serve organization settings and a plugin's
 * own settings (`/settings/<plugin>/properties`, its types only).
 */
export const PropertiesScopeContext = createContext<TPropertiesScope>(
  ORGANIZATION_PROPERTIES_SCOPE,
);

export const usePropertiesScope = () => useContext(PropertiesScopeContext);
