import { IRelationWidgetProps, RecordContextProvider } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { CoreWidgets } from '../core-widgets/CoreWidgets';
import { optionalProvider } from '../utils/optionalProvider';

const SafeRecordContextProvider = optionalProvider(RecordContextProvider);

export const WidgetsComponent = (props: IRelationWidgetProps) => {
  const { pluginName, contentType, contentId } = props;

  if (pluginName === 'core') {
    return <CoreWidgets {...props} />;
  }

  return (
    <SafeRecordContextProvider value={{ contentType, contentId }}>
      <RenderPluginsComponent
        pluginName={`${pluginName}_ui`}
        remoteModuleName="relationWidget"
        props={props}
      />
    </SafeRecordContextProvider>
  );
};
