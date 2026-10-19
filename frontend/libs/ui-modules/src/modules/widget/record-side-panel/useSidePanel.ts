import { useQueryState } from 'erxes-ui';
import { atomWithStorage } from 'jotai/utils';
import { useCallback, useMemo } from 'react';
import { matchPath } from 'react-router-dom';
import { TRelationEntity } from '../utils';
import { SIDE_PANEL_WIDTH } from './RecordSidePanel';

// The side panel keeps its own route in the URL, beside the page's:
// `/contacts/customers?panel=/detail/customer/<id>`, so it can be linked,
// survives a reload and stays open while the page underneath changes.
export const SIDE_PANEL_QUERY_KEY = 'panel';

// The width the user dragged the panel to, kept across reloads.
export const sidePanelWidthState = atomWithStorage<number>(
  'erxes:sidePanelWidth',
  SIDE_PANEL_WIDTH.default,
);

export const SIDE_PANEL_ROOT_PATH = '/';
export const SIDE_PANEL_DETAIL_PATH = '/detail/:typeName/:recordId';
// The assistant chat.
export const SIDE_PANEL_CHAT_PATH = '/chat';

// Short type names for core records; any other record uses its content
// type as the name, e.g. `/detail/sales:deal/<id>`.
const TYPE_NAME_CONTENT_TYPES: Record<string, string> = {
  customer: 'core:customer',
  company: 'core:company',
};

const CONTENT_TYPE_TYPE_NAMES = Object.fromEntries(
  Object.entries(TYPE_NAME_CONTENT_TYPES).map(([name, type]) => [type, name]),
);

export const getSidePanelRecordPath = ({
  contentType,
  contentId,
}: TRelationEntity) =>
  `/detail/${CONTENT_TYPE_TYPE_NAMES[contentType] || contentType}/${contentId}`;

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

/**
 * Opens, closes and navigates the side panel from anywhere, plugins
 * included: `openRecord({ contentType: 'core:customer', contentId })`.
 */
export const useSidePanel = () => {
  const [path, setPath] = useQueryState<string>(SIDE_PANEL_QUERY_KEY);

  const open = !!path;
  const record = useMemo(() => parseSidePanelRecord(path), [path]);

  const openPath = useCallback(
    (nextPath: string) => setPath(nextPath),
    [setPath],
  );

  const openRecord = useCallback(
    (entity: TRelationEntity) => setPath(getSidePanelRecordPath(entity)),
    [setPath],
  );

  const close = useCallback(() => setPath(null), [setPath]);

  const toggle = useCallback(
    () => setPath(path ? null : SIDE_PANEL_ROOT_PATH),
    [path, setPath],
  );

  return {
    open,
    path,
    record,
    openPath,
    openRecord,
    close,
    toggle,
  };
};
