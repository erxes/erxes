import React from 'react';


export const AppContext = React.createContext({} as any);

export const AppConsumer = AppContext.Consumer;

export const AppProvider = AppContext.Provider;
