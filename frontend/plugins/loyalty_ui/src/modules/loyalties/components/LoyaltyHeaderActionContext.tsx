import { createContext, useContext, useState } from 'react';

type LoyaltyHeaderActionContextType = {
  action: React.ReactNode;
  setAction: (node: React.ReactNode) => void;
};

const LoyaltyHeaderActionContext = createContext<LoyaltyHeaderActionContextType>(
  {
    action: null,
    setAction: () => {},
  },
);

export const useLoyaltyHeaderAction = () =>
  useContext(LoyaltyHeaderActionContext);

export const LoyaltyHeaderActionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [action, setAction] = useState<React.ReactNode>(null);

  return (
    <LoyaltyHeaderActionContext.Provider value={{ action, setAction }}>
      {children}
    </LoyaltyHeaderActionContext.Provider>
  );
};
