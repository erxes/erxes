import { useQuery } from "@apollo/client";
import { GET_IG_ACCOUNTS } from '../graphql/queries/igAccounts'


export const useInstagramAccounts = ()=> {
    
    const { data, loading, error, refetch } = useQuery<{
        instagramGetAccounts : {
            _id : string;
            name: string;
            accessToken : string;
            pageId : string | null;
        }[];
        }>(GET_IG_ACCOUNTS, {
            variables : {
                kind: 'instagram',
            },
        });

        const { instagramGetAccounts = [] } = data || {};

        return { instagramGetAccounts, loading, error, refetch };
    }
