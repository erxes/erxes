import { useMutation } from "@apollo/client";
import { ADD_TICKET_STATUS } from "@/settings/graphql/mutations/addTicketStatus";
import { useToast } from "erxes-ui";

export const useAddTicketStatus = () => {
    const { toast } = useToast();
    const [addStatus] = useMutation(ADD_TICKET_STATUS, {   
        onCompleted: () => {
            toast({
                title: 'Success!',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return {
        addStatus,
    };
};