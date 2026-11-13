import { matchPath } from 'react-router-dom';

/** A record the side panel can show: `core:customer`, `core:company`, `core:product`, … */
export interface TRelationEntity {
  contentType: string;
  contentId: string;
}

// A record shown beside its list, the list staying usable: a header and tabs.
export const SIDE_PANEL_WIDTH = { min: 320, max: 600, default: 400 };

// The side panel keeps its own route in the URL, beside the page's:
// `/contacts/customers?panel=/detail/customer/<id>`, so it can be linked,
// survives a reload and stays open while the page underneath changes.
export const SIDE_PANEL_QUERY_KEY = 'panel';
export const SIDE_PANEL_HISTORY_QUERY_KEY = 'panelHistory';
export const SIDE_PANEL_ROOT_PATH = '/';

const SIDE_PANEL_DETAIL_PATH = '/detail/:typeName/:recordId/:draftId?';

/**
 * The id of a record not created yet: `/detail/<type>/new` shows a draft of
 * that type. Nothing is saved until Save; the draft is then replaced by the
 * record.
 */
export const NEW_RECORD_ID = 'new';

// Short type names for core records; any other record uses its content
// type as the name, e.g. `/detail/sales:deal/<id>`.
const TYPE_NAME_CONTENT_TYPES: Record<string, string> = {
  customer: 'core:customer',
  company: 'core:company',
  product: 'core:product',
};

const CONTENT_TYPE_TYPE_NAMES = Object.fromEntries(
  Object.entries(TYPE_NAME_CONTENT_TYPES).map(([name, type]) => [type, name]),
);

/** Maps a record to its URL-backed panel route. */
export const getSidePanelRecordPath = ({ contentType, contentId }: TRelationEntity) =>
  `/detail/${CONTENT_TYPE_TYPE_NAMES[contentType] || contentType}/${contentId}`;

/** Parses record routes and expands short core contact type names. */
export const parseSidePanelRecord = (path: string | null): TRelationEntity | null => {
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
