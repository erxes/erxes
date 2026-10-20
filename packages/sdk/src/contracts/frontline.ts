import { defineContract } from './define';
import { frontlineInboxContract } from './frontline/inbox';
import { frontlineTicketsContract } from './frontline/tickets';

export const frontlineContract = defineContract('frontline', 1, [
  ...frontlineInboxContract.entries,
  ...frontlineTicketsContract.entries,
]);
