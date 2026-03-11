import { createContext, useContext } from 'react';

export interface IPermissionContext {
  can: (name: string) => boolean;
}

const defaultContext: IPermissionContext = {
  can: () => true,
};

export const PermissionContext =
  createContext<IPermissionContext>(defaultContext);

export const usePermissionContext = () => useContext(PermissionContext);
