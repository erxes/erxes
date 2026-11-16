import type { View, ViewRecordType } from '@erxes/core-contract';
import { listFilterQuery } from 'erxes-ui';
import { createSerializer, parseAsString } from 'nuqs';
import { LIST_PATHS } from '~/lib/paths';

/** A list's query: erxes-ui's filter bar's (the advanced filter and the search) and the selected view. */
export const listQuery = { ...listFilterQuery, view: parseAsString };

const serializeListQuery = createSerializer(listQuery);

/** A view's address: its list with the view, its filter and its search in the query (as the list keeps them). */
export const viewHref = (recordType: ViewRecordType, view: View) =>
  serializeListQuery(LIST_PATHS[recordType], {
    view: view.id,
    advanced: view.filter?.rules.length ? view.filter : null,
    searchValue: view.search || null,
  });
