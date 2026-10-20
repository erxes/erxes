// The contract extensions build against. Adding a slot means adding an entry
// here: the key is the slot name, the value is the props the host passes.
export type Slots = {
  'core.customer.detail.sections': { customerId: string };
  'sales.deal.detail.actions': { dealId: string };
};

export type SlotProps<N extends keyof Slots> = Slots[N];

/**
 * Records a plugin or extension can add to without a slot of its own: side
 * tabs (`widgets.relationWidgets[].contentTypes`) and actions
 * (`recordActions`). Each one's detail page and bulk bar render them.
 */
export type RecordContentType =
  | 'core:customer'
  | 'core:company'
  | 'sales:deal'
  | 'frontline:ticket'
  | 'operation:task';
