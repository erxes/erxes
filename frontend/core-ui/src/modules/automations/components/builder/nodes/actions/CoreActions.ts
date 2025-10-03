import { lazy } from 'react';

export const coreActions = {
  delay: lazy(() =>
    import('./delay/components/Delay').then((module) => ({
      default: module.Delay.NodeContent,
    })),
  ),
  setProperty: lazy(() =>
    import('./manageProperties/component/ManageProperties').then((module) => ({
      default: module.ManageProperties.NodeContent,
    })),
  ),
  sendEmail: lazy(() =>
    import('./sendEmail/components/SendEmail').then((module) => ({
      default: module.SendEmail.NodeContent,
    })),
  ),
};

export const coreActionNames = Object.keys(coreActions);
