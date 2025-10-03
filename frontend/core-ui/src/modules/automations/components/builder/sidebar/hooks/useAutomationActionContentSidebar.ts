import { useAutomation } from '@/automations/context/AutomationProvider';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { useSetAtom } from 'jotai';
import { lazy } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const Delay = lazy(() =>
  import('../../nodes/actions/delay/components/Delay').then((module) => ({
    default: module.Delay.SideBarContent,
  })),
);

const Branches = lazy(() =>
  import('../../nodes/actions/branches/components/Branches').then((module) => ({
    default: module.Branches,
  })),
);

const ManageProperties = lazy(() =>
  import(
    '../../nodes/actions/manageProperties/component/ManageProperties'
  ).then((module) => ({
    default: module.ManageProperties.SideBarContent,
  })),
);
const AutomationSendEmail = lazy(() =>
  import('../../nodes/actions/sendEmail/components/SendEmail').then(
    (module) => ({
      default: module.SendEmail.SideBarContent,
    }),
  ),
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

export const useAutomationActionContentSidebar = () => {
  const { queryParams, setQueryParams } = useAutomation();
  const { control, setValue } = useFormContext<TAutomationBuilderForm>();
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);

  // Watch all actions once
  const actions = useWatch({ control, name: 'actions' }) || [];

  // Find the index of the active node by id
  const currentIndex = actions.findIndex(
    (action) => action.id === queryParams?.activeNodeId,
  );

  // Safely get currentAction, guard against -1
  const currentAction = currentIndex >= 0 ? actions[currentIndex] : null;

  // Pick component from Actions map or fallback to null
  const Component = currentAction ? Actions[currentAction.type] ?? null : null;

  return {
    Component,
    control,
    currentIndex,
    currentAction,
    setQueryParams,
    setValue,
    toggleSideBarOpen,
  };
};
