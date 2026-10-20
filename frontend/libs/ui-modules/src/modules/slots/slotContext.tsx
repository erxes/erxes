import { createContext, useContext } from 'react';

export type RenderSlotRemote = (props: {
  pluginName: string;
  expose: string;
  props: object;
}) => JSX.Element | null;

export const SlotContext = createContext<{ RenderRemote: RenderSlotRemote }>({
  RenderRemote: () => null,
});

export const SlotProvider = ({
  children,
  RenderRemote,
}: {
  children: React.ReactNode;
  RenderRemote: RenderSlotRemote;
}) => (
  <SlotContext.Provider value={{ RenderRemote }}>
    {children}
  </SlotContext.Provider>
);

export const useSlotContext = () => useContext(SlotContext);
