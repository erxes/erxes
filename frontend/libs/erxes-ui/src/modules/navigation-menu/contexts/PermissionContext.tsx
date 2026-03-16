import { createContext, useContext } from 'react';

export type PermissionScope = 'own' | 'group' | 'all';

export interface IPermissionContext {
  /** Check module-level access (backward compatible) */
  can: (name: string) => boolean;
  /** Check a specific action like 'taskCreate', 'taskRemove' */
  canAction: (action: string) => boolean;
  /** Get the scope for a given module (own/group/all) */
  getScope: (module: string) => PermissionScope | null;
  /** True while permissions are loading */
  loading: boolean;
}

const defaultContext: IPermissionContext = {
  can: () => true,
  canAction: () => true,
  getScope: () => 'all',
  loading: false,
};

export const PermissionContext =
  createContext<IPermissionContext>(defaultContext);

export const usePermissionContext = () => useContext(PermissionContext);
