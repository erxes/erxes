import { createContext, useContext, useState } from 'react';

type SetAction = React.Dispatch<React.SetStateAction<React.ReactNode>>;

const LoyaltyHeaderActionValueContext = createContext<React.ReactNode>(null);
const LoyaltyHeaderActionSetterContext = createContext<SetAction>(() => {});

export const useLoyaltyHeaderActionValue = (): React.ReactNode =>
  useContext(LoyaltyHeaderActionValueContext);

export const useSetLoyaltyHeaderAction = (): SetAction =>
  useContext(LoyaltyHeaderActionSetterContext);

export const useLoyaltyHeaderAction = (): {
  action: React.ReactNode;
  setAction: SetAction;
} => ({
  action: useLoyaltyHeaderActionValue(),
  setAction: useSetLoyaltyHeaderAction(),
});

export const LoyaltyHeaderActionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [action, setAction] = useState<React.ReactNode>(null);

  return (
    <LoyaltyHeaderActionSetterContext.Provider value={setAction}>
      <LoyaltyHeaderActionValueContext.Provider value={action}>
        {children}
      </LoyaltyHeaderActionValueContext.Provider>
    </LoyaltyHeaderActionSetterContext.Provider>
  );
};
