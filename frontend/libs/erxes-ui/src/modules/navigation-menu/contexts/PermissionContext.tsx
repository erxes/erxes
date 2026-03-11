import { createContext, useContext } from 'react';

export interface IPermissionContext {
  canAccessModule: (module: string) => boolean;
}

const defaultContext: IPermissionContext = {
  canAccessModule: () => true,
};

export const PermissionContext =
  createContext<IPermissionContext>(defaultContext);

export const usePermissionContext = () => useContext(PermissionContext);
