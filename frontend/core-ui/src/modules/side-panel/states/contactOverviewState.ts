import { atomWithStorage } from 'jotai/utils';

// Which sections of a contact overview the user folded (or, for modules
// without a section of their own, unfolded), by `<contact type>:<module>`.
export const contactOverviewFoldedState = atomWithStorage<
  Record<string, boolean>
>('erxes:contactOverviewFolded', {});

// How the user arranged a contact type's overview: module order, and the
// modules shown as their own panel tab. Kept in this browser only.
export interface IContactOverviewLayout {
  order: string[];
  tabs: string[];
}

export const contactOverviewLayoutState = atomWithStorage<
  Record<string, IContactOverviewLayout>
>('erxes:contactOverviewLayout', {});
