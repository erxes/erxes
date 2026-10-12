import {
  IRecordPickerWidgetProps,
  useRecordPickerWidget,
} from './recordPickerWidgetContext';

/**
 * A field for picking another plugin's record, drawn by the plugin that owns
 * it. The host names only the record type; nothing renders when no enabled
 * plugin offers a picker for it.
 */
export const RecordPickerWidget = ({
  contentType,
  ...props
}: Omit<IRecordPickerWidgetProps, 'module' | 'pluginName'>) => {
  const { RecordPickerWidget: Render, recordPickerWidgetsModules } =
    useRecordPickerWidget();
  const module = recordPickerWidgetsModules.find(
    (candidate) => candidate.contentType === contentType,
  );

  if (!module) {
    return null;
  }

  // The picker's own sheets submit forms; the host's form must not hear them.
  return (
    <div onSubmit={(event) => event.stopPropagation()}>
      <Render
        module={module.name}
        pluginName={module.pluginName}
        contentType={contentType}
        {...props}
      />
    </div>
  );
};
