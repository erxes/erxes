// TicketContext.tsx
import React, { createContext, useContext, useState } from "react";

interface TicketContextProps {
  ticketData: any;
  setTicketData: (data: any) => void;
}

const TicketContext = createContext<TicketContextProps | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ticketData, setTicketData] = useState<any>(null);
  return (
    <TicketContext.Provider value={{ ticketData, setTicketData }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTicket must be used within a TicketProvider");
  }
  return context;
};
