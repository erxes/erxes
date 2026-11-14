import { ConditionGroup, type View, type ViewRecordType } from '@erxes/core-contract';
import { createSerializer, parseAsJson, parseAsString } from 'nuqs';
import { LIST_PATHS } from '~/lib/paths';

/** A list's query: the advanced filter, the selected view and the search. */
export const listQuery = {
  // Anyone can edit a URL: a filter that doesn't parse reads as none.
  advanced: parseAsJson((value) => ConditionGroup.safeParse(value).data ?? null),
  view: parseAsString,
  searchValue: parseAsString,
};

const serializeListQuery = createSerializer(listQuery);

/** A view's address: its list with the view, its filter and its search in the query (as the list keeps them). */
export const viewHref = (recordType: ViewRecordType, view: View) =>
  serializeListQuery(LIST_PATHS[recordType], {
    view: view.id,
    advanced: view.filter?.rules.length ? view.filter : null,
    searchValue: view.search || null,
  });
