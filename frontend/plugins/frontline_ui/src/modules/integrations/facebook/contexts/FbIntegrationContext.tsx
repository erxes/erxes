import { createContext, useContext } from 'react';

export const FbIntegrationContext = createContext<{
  isPost?: boolean;
}>({});

export const useFbIntegrationContext = () => {
  return useContext(FbIntegrationContext);
};

export const FbIntegrationProvider = ({
  children,
  isPost,
}: {
  children: React.ReactNode;
  isPost?: boolean;
}) => {
  return (
    <FbIntegrationContext.Provider value={{ isPost }}>
      {children}
    </FbIntegrationContext.Provider>
  );
};
