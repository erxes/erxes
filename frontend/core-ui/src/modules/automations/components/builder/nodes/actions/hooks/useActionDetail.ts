import { useAutomation } from '@/automations/context/AutomationProvider';
import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { lazy } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const Delay = lazy(() =>
  import('../delay/components/Delay').then((module) => ({
    default: module.Delay.SideBarContent,
  })),
);

const Branches = lazy(() =>
  import('../branches/components/Branches').then((module) => ({
    default: module.Branches,
  })),
);

const ManageProperties = lazy(() =>
  import('../manageProperties/component/ManageProperties').then((module) => ({
    default: module.ManageProperties.SideBarContent,
  })),
);
const AutomationSendEmail = lazy(() =>
  import('../sendEmail/components/SendEmail').then((module) => ({
    default: module.SendEmail.SideBarContent,
  })),
);

const Actions: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  delay: Delay,
  if: Branches,
  setProperty: ManageProperties,
  sendEmail: AutomationSendEmail,
};

export const useActionDetail = () => {
  const { queryParams } = useAutomation();
  const { control } = useFormContext<TAutomationBuilderForm>();

  // Watch all actions once
  const actions =
    useWatch({
      control,
      name: 'actions',
    }) || [];

  const currentIndex = actions.findIndex(
    (action) => action.id === queryParams?.activeNodeId,
  );
  const currentAction = currentIndex >= 0 ? actions[currentIndex] : null;

  const Component =
    currentAction && Actions[currentAction.type]
      ? Actions[currentAction.type]
      : null;

  return { Component, control, currentIndex, currentAction };
};
