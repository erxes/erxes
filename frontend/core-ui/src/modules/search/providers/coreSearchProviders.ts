import { ISearchProvider } from 'erxes-ui';
import {
  companiesSearchProvider,
  customersSearchProvider,
} from '@/search/providers/contactsProviders';
import { productsSearchProvider } from '@/search/providers/productProviders';
import { teamMembersSearchProvider } from '@/search/providers/settingsProviders';

export const CORE_SEARCH_PROVIDERS: ISearchProvider[] = [
  customersSearchProvider,
  companiesSearchProvider,
  productsSearchProvider,
  teamMembersSearchProvider,
];
