import { createContext, useContext } from "react";

export const MoreDataContext = createContext(null);

export const useMoreDataContext = () => {
  const context = useContext(MoreDataContext);
  if (!context) {
    throw new Error(
      'useRecordTableCursorContext must be used within a RecordTableCursorProvider',
    );
  }
  return context;
};
