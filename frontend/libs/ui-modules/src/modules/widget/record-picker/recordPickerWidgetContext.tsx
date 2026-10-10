import { createContext, useContext } from 'react';

export interface IRecordPickerWidgetProps {
  module: string;
  pluginName: string;
  // The record type picked, e.g. `loyalty:score.campaigns`.
  contentType: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export interface IRecordPickerModule {
  name: string;
  pluginName: string;
  contentType: string;
}

type TRecordPickerWidgetContextValue = {
  RecordPickerWidget: (props: IRecordPickerWidgetProps) => JSX.Element | null;
  recordPickerWidgetsModules: IRecordPickerModule[];
};

const RecordPickerWidgetContext =
  createContext<TRecordPickerWidgetContextValue>({
    RecordPickerWidget: () => null,
    recordPickerWidgetsModules: [],
  });

export const RecordPickerWidgetProvider = ({
  children,
  ...value
}: TRecordPickerWidgetContextValue & { children: React.ReactNode }) => (
  <RecordPickerWidgetContext.Provider value={value}>
    {children}
  </RecordPickerWidgetContext.Provider>
);

export const useRecordPickerWidget = () =>
  useContext(RecordPickerWidgetContext);
