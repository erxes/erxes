import { ticketViewAtom } from '@/ticket/states/ticketViewState';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router';

export const useTicketsView = () => {
  const { teamId } = useParams();
  const view = useAtomValue(ticketViewAtom);

  return view === 'list' || !teamId ? 'list' : view;
};
