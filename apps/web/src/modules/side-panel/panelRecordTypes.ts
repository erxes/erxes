import type { ComponentType } from 'react';
import { getContactListPath } from '~/modules/contacts/utils/contactDetailPath';
import { PluginRecordNew, PluginRecordView } from '~/modules/plugins/PluginRecordView';
import { usePluginRecordType } from '~/modules/plugins/usePluginRecordType';
import { ProductPanel } from '~/modules/products/panel/ProductPanel';
import { ProductPanelNew } from '~/modules/products/panel/ProductPanelNew';
import { paths } from '~/lib/paths';
import { CompanyPanelNew } from './details/CompanyPanelNew';
import { CustomerPanelNew } from './details/CustomerPanelNew';
import type { IRecordViewProps } from './recordView';
import { SidePanelSavedRecord } from './SidePanelSavedRecord';
import { NEW_RECORD_ID, type TRelationEntity } from './sidePanelPaths';

interface IPanelRecordType {
  /** What one is called, for its draft's title: "New customer". */
  label: string;
  /** A saved record: its header and tabs. */
  View: ComponentType<IRecordViewProps>;
  /** A record not created yet; once saved, the record takes its place. None: no drafts. */
  New?: ComponentType<{ contentType: string }>;
  /** The list a record's own page goes back to; `pathname` is the page open now. */
  listPath: (pathname: string) => string;
  /** A plugin record's own page; core's are `<listPath>/<id>`. */
  pagePath?: (contentId: string) => string;
}

/** Core's records the side panel shows. Each expands to its own page, `<listPath>/<id>`. */
const PANEL_RECORD_TYPES = {
  'core:customer': {
    label: 'Customer',
    View: SidePanelSavedRecord,
    New: CustomerPanelNew,
    listPath: (pathname) => getContactListPath('core:customer', pathname),
  },
  'core:company': {
    label: 'Company',
    View: SidePanelSavedRecord,
    New: CompanyPanelNew,
    listPath: (pathname) => getContactListPath('core:company', pathname),
  },
  'core:product': {
    label: 'Product',
    View: ProductPanel,
    New: ProductPanelNew,
    listPath: () => paths.products.list,
  },
} satisfies Record<string, IPanelRecordType>;

export type TPanelContentType = keyof typeof PANEL_RECORD_TYPES;

const isPanelContentType = (contentType: string): contentType is TPanelContentType =>
  Object.hasOwn(PANEL_RECORD_TYPES, contentType);

/**
 * How the panel shows records of `contentType`: core's, or one an installed plugin the member
 * may use registers (`recordTypes` in its `CONFIG`). `loading` while plugins still load, so a
 * plugin record's link doesn't read as broken on a reload.
 */
export const usePanelRecordType = (
  contentType: string,
): { type: IPanelRecordType | undefined; loading: boolean } => {
  const { entry, loading } = usePluginRecordType(contentType);

  if (isPanelContentType(contentType)) {
    return { type: PANEL_RECORD_TYPES[contentType], loading: false };
  }

  if (!entry) return { type: undefined, loading };

  return {
    type: {
      label: entry.type.title,
      View: PluginRecordView,
      New: entry.type.New ? PluginRecordNew : undefined,
      // A plugin's own page goes back to the plugin's first page.
      listPath: () => entry.base,
      pagePath: entry.type.detailPath,
    },
    loading: false,
  };
};

/** A saved record's own page, where the panel's expand button leads. */
export const recordPagePath = (
  type: IPanelRecordType | undefined,
  { contentId }: TRelationEntity,
  pathname: string,
) => {
  if (!type || contentId === NEW_RECORD_ID) return null;

  if (type.pagePath) return type.pagePath(contentId);

  return `${type.listPath(pathname)}/${encodeURIComponent(contentId)}`;
};
