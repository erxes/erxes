import React, { createContext, useContext } from 'react';
import { useSecondTick } from '../hooks/useSecondTick';

const TickContext = createContext(0);

export function TickProvider({ children }) {
  const tick = useSecondTick();
  console.log('asd', 'asd');
  return <TickContext.Provider value={tick}>{children}</TickContext.Provider>;
}

export function useTick() {
  return useContext(TickContext);
}
