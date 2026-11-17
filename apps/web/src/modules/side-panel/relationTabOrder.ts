import { savedOrderState, useSavedOrder } from '~/lib/savedOrder';

/** Plugin relation tabs in the order the member dragged them, on every record. */
const relationTabOrderState = savedOrderState('erxes:side-panel:relation-tab-order');

export const useRelationTabOrder = () => useSavedOrder(relationTabOrderState);
