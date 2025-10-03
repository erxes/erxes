import React, { createContext, useContext } from 'react';

type DragDirection = 'vertical' | 'horizontal' | 'both';

const DragDirectionContext = createContext<DragDirection>('both');

export const useDragDirection = () => useContext(DragDirectionContext);

export const DragDirectionProvider = ({
  direction,
  children,
}: {
  direction: DragDirection;
  children: React.ReactNode;
}) => {
  return (
    <DragDirectionContext.Provider value={direction}>
      {children}
    </DragDirectionContext.Provider>
  );
};
