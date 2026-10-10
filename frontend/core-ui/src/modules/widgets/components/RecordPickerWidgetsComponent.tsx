import { IRecordPickerWidgetProps } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

export const RecordPickerWidgetsComponent = (
  props: IRecordPickerWidgetProps,
) => (
  <RenderPluginsComponent
    pluginName={`${props.pluginName}_ui`}
    remoteModuleName="recordPickerWidget"
    props={props}
  />
);
