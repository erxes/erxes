import type { View, ViewRecordType } from "@erxes/core-contract";

/** Where each list lives: a view opens on its own list. */
export const VIEW_LIST_PATHS: Record<ViewRecordType, string> = {
  customer: "/contacts/customers",
  company: "/contacts/companies",
  lead: "/contacts/leads",
  company_lead: "/contacts/leads/companies",
};

/** A view's address: its list with the view, its filter and its search in the query (as the list keeps them). */
export const viewHref = (recordType: ViewRecordType, view: View) => {
  const params = new URLSearchParams({ view: view.id });

  if (view.filter?.rules.length)
    params.set("advanced", JSON.stringify(view.filter));
  if (view.search) params.set("searchValue", view.search);

  return `${VIEW_LIST_PATHS[recordType]}?${params.toString()}`;
};
