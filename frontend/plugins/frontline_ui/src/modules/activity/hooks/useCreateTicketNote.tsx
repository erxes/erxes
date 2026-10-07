import { useMutation } from '@apollo/client';
import { CREATE_TICKET_NOTE } from '@/activity/graphql/mutations/createTicketNote';
import { INote } from '@/activity/types';

interface ICreateTicketNoteResponse {
  ticketCreateNote: INote;
}

export const useCreateTicketNote = () => {
  const [createTicketNote, { loading, error }] =
    useMutation<ICreateTicketNoteResponse>(CREATE_TICKET_NOTE);

  return {
    createTicketNote,
    loading,
    error,
  };
};
