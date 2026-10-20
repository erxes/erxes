// The contract extensions build against. Adding a slot means adding an entry
// here: the key is the slot name, the value is the props the host passes.
export type Slots = {
  'core.customer.detail.sections': { customerId: string };
};

export type SlotProps<N extends keyof Slots> = Slots[N];
