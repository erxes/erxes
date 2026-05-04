import { lazy } from 'react';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';

const SendEmailComponents: AutomationComponentMap<AutomationNodeType.Action> = {
  sendEmail: {
    sidebar: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailConfigForm'
      ).then((module) => ({
        default: module.SendEmailConfigForm,
      })),
    ),
    nodeContent: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailNodeContent'
      ).then((module) => ({
        default: module.SendEmailNodeContent,
      })),
    ),
    actionResult: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailActionResult'
      ).then((module) => ({
        default: module.AutomationSendEmailActionResult,
      })),
    ),
  },
};

export default SendEmailComponents;
