import { useAtom } from 'jotai';
import { broadcastContactsState } from '../states/broadcastContactsState';

/** The customers a campaign is being started for, when started from contacts. */
export const useBroadcastContacts = () => {
  const [contactIds, setContactIds] = useAtom(broadcastContactsState);

  return {
    contactIds,
    setContacts: setContactIds,
    clearContacts: () => setContactIds([]),
  };
};
