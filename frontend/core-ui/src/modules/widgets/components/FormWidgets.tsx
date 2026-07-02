import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FocusSheet } from 'erxes-ui';
import { toFormWidgetForm } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { useFormWidgetsModules } from '../hooks/useFormWidgets';

export const FormWidgetSideTabs = <T extends FieldValues>({
  contentType,
  contentId,
  form,
}: {
  contentType: string;
  contentId?: string;
  form: UseFormReturn<T>;
}) => {
  const modules = useFormWidgetsModules(contentType);
  const formWidgetForm = toFormWidgetForm(form);

  if (!modules.length) {
    return null;
  }

  return (
    <FocusSheet.SideTabs>
      {modules.map((module) => (
        <FocusSheet.SideContent
          key={`${module.pluginName}:${module.name}`}
          value={module.name}
        >
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
        </FocusSheet.SideContent>
      ))}
      <FocusSheet.SideTabsList>
        {modules.map((module) => (
          <FocusSheet.SideTabsTrigger
            key={`${module.pluginName}:${module.name}`}
            value={module.name}
            Icon={module.icon}
            label={module.name.charAt(0).toUpperCase() + module.name.slice(1)}
          />
        ))}
      </FocusSheet.SideTabsList>
    </FocusSheet.SideTabs>
  );
};
