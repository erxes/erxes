/**
 * The record's main tab (Activity, mostly) leads: first beside the overview on a record's page,
 * right after the overview in the panel, so plugin tabs never push it into More.
 */
export const leadWith = <T extends { value: string }>(
  tabs: T[],
  lead: string | undefined,
  overview?: string,
): T[] => {
  const main = tabs.find((tab) => tab.value === lead);

  if (!main) return tabs;

  const rest = tabs.filter((tab) => tab !== main);
  const overviewTab = rest.find((tab) => tab.value === overview);

  return overviewTab
    ? [overviewTab, main, ...rest.filter((tab) => tab !== overviewTab)]
    : [main, ...rest];
};
