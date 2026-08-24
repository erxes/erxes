import { getManagePropertiesResultPreview } from '@/automations/components/builder/nodes/actions/manageProperties/utils/managePropertiesResultPreview';
import { lazy } from 'react';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';

const ManagePropertiesComponents: AutomationComponentMap<AutomationNodeType.Action> =
  {
    setProperty: {
      sidebar: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertiesConfigForm'
        ).then((module) => ({
          default: module.ManagePropertiesConfigForm,
        })),
      ),
      nodeContent: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertiesNodeContent'
        ).then((module) => ({
          default: module.ManagePropertiesNodeContent,
        })),
      ),
      actionResult: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertiesActionResult'
        ).then((module) => ({
          default: module.ManagePropertiesActionResult,
        })),
      ),
      actionResultPreview: getManagePropertiesResultPreview,
    },
  };

export default ManagePropertiesComponents;
