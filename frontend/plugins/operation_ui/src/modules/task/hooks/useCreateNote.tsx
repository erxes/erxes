import { useMutation } from "@apollo/client";
import { CREATE_NOTE } from "@/task/graphql/mutations/createNote";

export const useCreateNote = () => {
    const [createNote, { loading, error }] = useMutation(CREATE_NOTE);
    return {
        createNote,
        loading,
        error,
    }
}