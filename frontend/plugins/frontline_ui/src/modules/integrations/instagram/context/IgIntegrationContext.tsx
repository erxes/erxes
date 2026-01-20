import { createContext, useContext } from 'react'


export const IgIntegrationContext = createContext<{
    isPost? : boolean;
}>({});


export const useIgIntegrationContext = () => {
    return useContext(IgIntegrationContext);
}

export const IgIntegrationProvider = ({
    children,
    isPost,
} : {
    children : React.ReactNode;
    isPost?: boolean;
}) => {
    return (
        <IgIntegrationContext.Provider value = {{ isPost }}>
            {children}
        </IgIntegrationContext.Provider>
    )
}