import { createContext, useContext } from 'react';

export const ProductPanelIdContext = createContext<string | null>(null);
export const useProductPanelId = () => useContext(ProductPanelIdContext);
