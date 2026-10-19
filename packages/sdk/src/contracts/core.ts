import { defineContract } from './define';
import { coreContactsContract } from './core/contacts';
import { coreProductsContract } from './core/products';
import { coreTeamContract } from './core/team';

export const coreContract = defineContract('core', 1, [
  ...coreContactsContract.entries,
  ...coreProductsContract.entries,
  ...coreTeamContract.entries,
]);
