import React, { useContext } from 'react';
import { createContext, useState } from 'react';
import { RecordTableArrowEffect } from '../components/RecordTableArrowEffect';

interface IRecordTableHotkeyContext {
  activeRow: string | null;
  activeCell: [number, number];
  setActiveRow: (rowId: string | null) => void;
  setActiveCell: (cell: [number, number]) => void;
  scope: string;
}

const RecordTableHotkeyContext =
  createContext<IRecordTableHotkeyContext | null>(null);

export const RecordTableHotkeyProvider = ({
  children,
  columnLength,
  rowLength,
  scope,
}: {
  children: React.ReactNode;
  columnLength: number;
  rowLength: number;
  scope: string;
}) => {
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<[number, number]>([0, -1]);

  return (
    <RecordTableHotkeyContext.Provider
      value={{
        activeRow,
        activeCell,
        setActiveRow,
        setActiveCell,
        scope,
      }}
    >
      {children}
      <RecordTableArrowEffect
        columnLength={columnLength}
        rowLength={rowLength}
      />
    </RecordTableHotkeyContext.Provider>
  );
};

export const useRecordTableHotkey = () => {
  const context = useContext(RecordTableHotkeyContext);
  if (!context) {
    throw new Error(
      'useRecordTableHotkey must be used within a RecordTableHotkeyProvider.',
    );
  }
  return context;
};
