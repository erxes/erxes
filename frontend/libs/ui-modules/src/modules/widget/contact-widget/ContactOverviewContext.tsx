import { createContext, useContext } from 'react';

/**
 * Given by a customer's or company's overview to each section in it: keeps
 * the section's folded state there, so it is remembered for the user.
 */
export interface IContactOverviewSection {
  folded: boolean;
  setFolded: (folded: boolean) => void;
}

export const ContactOverviewSectionContext =
  createContext<IContactOverviewSection | null>(null);

// `null` outside an overview: the section then folds on its own.
export const useContactOverviewSection = () =>
  useContext(ContactOverviewSectionContext);
