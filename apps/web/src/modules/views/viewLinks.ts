import type { View, ViewListType } from '@erxes/core-contract';
import { listFilterQuery } from 'erxes-ui';
import { createSerializer, parseAsString } from 'nuqs';
import { LIST_PATHS } from '~/lib/paths';

/** A list's query: erxes-ui's filter bar's (the advanced filter and the search) and the selected view. */
export const listQuery = { ...listFilterQuery, view: parseAsString };

const serializeListQuery = createSerializer(listQuery);

/** A plugin's list (`sales:deal`), not one of core's. */
export const isPluginList = (recordType: ViewListType): recordType is `${string}:${string}` =>
  recordType.includes(':');

/** Where a list lives: core's own path, or the page a plugin's list is on. */
const listPath = (recordType: ViewListType) =>
  isPluginList(recordType) ? window.location.pathname : LIST_PATHS[recordType];

/** A view's address: its list with the view, its filter and its search in the query (as the list keeps them). */
export const viewHref = (recordType: ViewListType, view: View) =>
  serializeListQuery(listPath(recordType), {
    view: view.id,
    advanced: view.filter?.rules.length ? view.filter : null,
    searchValue: view.search || null,
  });
