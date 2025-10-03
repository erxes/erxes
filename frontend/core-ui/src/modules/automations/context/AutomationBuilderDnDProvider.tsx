import { createContext, useContext, useState } from 'react';

const DnDContext = createContext([null, (_: any) => {}]);

export const AutomationBuilderDnDProvider = ({ children }: any) => {
  const [type, setType] = useState(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

export const useDnD = () => {
  return useContext(DnDContext);
};
