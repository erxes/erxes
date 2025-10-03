import { useContext } from 'react';
import { RecordTableCursorContext } from '../contexts/RecordTableCursorContext';

export const useRecordTableCursorContext = () => {
  const context = useContext(RecordTableCursorContext);
  if (!context) {
    throw new Error(
      'useRecordTableCursorContext must be used within a RecordTableCursorProvider',
    );
  }
  return context;
};
