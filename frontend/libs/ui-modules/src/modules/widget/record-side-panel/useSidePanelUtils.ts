import { matchPath } from 'react-router-dom';
import type { TRelationEntity } from 'ui-modules/modules/widget/utils';

export const SIDE_PANEL_DETAIL_PATH = '/detail/:typeName/:recordId/:draftId?';

// The side panel keeps its own route in the URL, beside the page's:
// `/contacts/customers?panel=/detail/customer/<id>`, so it can be linked,
// survives a reload and stays open while the page underneath changes.
export const SIDE_PANEL_QUERY_KEY = 'panel';

// Short type names for core records; any other record uses its content
// type as the name, e.g. `/detail/sales:deal/<id>`.
const TYPE_NAME_CONTENT_TYPES: Record<string, string> = {
  customer: 'core:customer',
  company: 'core:company',
};

const CONTENT_TYPE_TYPE_NAMES = Object.fromEntries(
  Object.entries(TYPE_NAME_CONTENT_TYPES).map(([name, type]) => [type, name]),
);

/** Maps a relation entity to its URL-backed panel route. */
export const getSidePanelRecordPath = ({
  contentType,
  contentId,
}: TRelationEntity) =>
  `/detail/${CONTENT_TYPE_TYPE_NAMES[contentType] || contentType}/${contentId}`;

/** Parses record routes and expands short core contact type names. */
export const parseSidePanelRecord = (
  path: string | null,
): TRelationEntity | null => {
  const match = path ? matchPath(SIDE_PANEL_DETAIL_PATH, path) : null;

  if (!match?.params.typeName || !match.params.recordId) {
    return null;
  }

  const { typeName, recordId } = match.params;

  return {
    contentType: TYPE_NAME_CONTENT_TYPES[typeName] || typeName,
    contentId: recordId,
  };
};

export const getRecordPanelListUrl = (
  listPath: string,
  record: TRelationEntity,
) => {
  const [pathname, search = ''] = listPath.split('?');
  const params = new URLSearchParams(search);

  params.set(SIDE_PANEL_QUERY_KEY, getSidePanelRecordPath(record));

  return `${pathname}?${params.toString()}`;
};
