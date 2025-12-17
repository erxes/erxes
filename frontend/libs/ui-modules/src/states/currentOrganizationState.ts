import { atom } from 'jotai';

export type CurrentOrganization = {
  name: string;
  hasOwner?: boolean;
  logo?: string;
  theme?: {
    logo?: string;
    favicon?: string;
  };
  plugins?: {
    name: string;
    url: string;
  }[];
  type?: string;
  orgLogo?: string;
  orgLoginText?: string;
  orgLoginDescription?: string;
  orgFavicon?: string;
  orgShortDescription?: string;
  orgShortName?: string;
};

export const currentOrganizationState = atom<CurrentOrganization | null>(null);
