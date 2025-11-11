import { useMutation } from "@apollo/client";
import { CREATE_TICKET_NOTE } from "@/activity/graphql/mutations/createTicketNote";

export const useCreateTicketNote = () => {
    const [createTicketNote, { loading, error }] = useMutation(CREATE_TICKET_NOTE);
    return {
        createTicketNote,
        loading,
        error,
    }
}