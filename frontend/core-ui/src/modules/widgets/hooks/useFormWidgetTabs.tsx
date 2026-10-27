import { FieldValues, UseFormReturn } from 'react-hook-form';
import { IconApps } from '@tabler/icons-react';
import {
  getRelationWidgetLabel,
  IRecordSidePanelTab,
  toFormWidgetForm,
} from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { useFormWidgetsModules } from './useFormWidgets';

export const useFormWidgetTabs = <T extends FieldValues>({
  contentType,
  contentId,
  form,
}: {
  contentType: string;
  contentId?: string;
  form: UseFormReturn<T>;
}): IRecordSidePanelTab[] => {
  const modules = useFormWidgetsModules(contentType);
  const formWidgetForm = toFormWidgetForm(form);

  return modules.map((module) => ({
    value: `form:${module.pluginName}:${module.name}`,
    label: getRelationWidgetLabel(module),
    icon: module.icon || IconApps,
    content: (
      <RenderPluginsComponent
        pluginName={`${module.pluginName}_ui`}
        remoteModuleName="formWidget"
        props={{
          pluginName: module.pluginName,
          contentType: module.contentType,
          contentId,
          form: formWidgetForm,
        }}
      />
    ),
  }));
};
