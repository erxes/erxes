import { useAtomValue } from "jotai"
import { selectedInstagramAccountAtom } from "../states/instagramStates"
import { useIgIntegrationContext } from "../context/IgIntegrationContext";
import { useQuery } from "@apollo/client";
import { GET_IG_PAGES } from "../graphql/queries/igAccounts";
import { IntegrationType } from "@/types/Integration";





export const useInstagramPages = () => {
    const selectedAccount = useAtomValue( selectedInstagramAccountAtom );
    const { isPost } = useIgIntegrationContext();
    const { data, loading, error} = useQuery<{
        instagramGetPages: {
            id: string;
            name : string;
            isUsed : boolean;
        }[];
    }> (GET_IG_PAGES, {
        variables : {
            accountId: selectedAccount,
            kind: isPost
                ? IntegrationType.INSTAGRAM_POST
                : IntegrationType.INSTAGRAM_MESSENGER,
        },
        skip: !selectedAccount,
    });

    const { instagramGetPages = [] } = data || {};

    return { instagramGetPages, loading, error };
}