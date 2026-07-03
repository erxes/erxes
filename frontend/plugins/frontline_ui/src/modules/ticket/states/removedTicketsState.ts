
const removedTicketIds = new Set<string>();

export const markTicketsRemoved = (ids: string[]) => {
  ids.forEach((id) => removedTicketIds.add(id));
};

export const unmarkTicketsRemoved = (ids: string[]) => {
  ids.forEach((id) => removedTicketIds.delete(id));
};

export const isTicketRemoved = (id?: string | null): boolean =>
  !!id && removedTicketIds.has(id);
