import type { ComponentType } from 'react';
import { getContactListPath } from '~/modules/contacts/utils/contactDetailPath';
import { ProductPanel } from '~/modules/products/panel/ProductPanel';
import { ProductPanelNew } from '~/modules/products/panel/ProductPanelNew';
import { PRODUCTS_PATH } from '~/modules/products/paths';
import { CompanyPanelNew } from './details/CompanyPanelNew';
import { CustomerPanelNew } from './details/CustomerPanelNew';
import type { IRecordViewProps } from './recordView';
import { SidePanelSavedRecord } from './SidePanelSavedRecord';
import { NEW_RECORD_ID, type TRelationEntity } from './sidePanelPaths';

interface IPanelRecordType {
  /** A saved record: its header and tabs. */
  View: ComponentType<IRecordViewProps>;
  /** A record not created yet; once saved, the record takes its place. */
  New: ComponentType;
  /** The list a record's own page goes back to; `pathname` is the page open now. */
  listPath: (pathname: string) => string;
}

/** The records the side panel shows. Each expands to its own page, `<listPath>/<id>`. */
const PANEL_RECORD_TYPES = {
  'core:customer': {
    View: SidePanelSavedRecord,
    New: CustomerPanelNew,
    listPath: (pathname) => getContactListPath('core:customer', pathname),
  },
  'core:company': {
    View: SidePanelSavedRecord,
    New: CompanyPanelNew,
    listPath: (pathname) => getContactListPath('core:company', pathname),
  },
  'core:product': {
    View: ProductPanel,
    New: ProductPanelNew,
    listPath: () => PRODUCTS_PATH,
  },
} satisfies Record<string, IPanelRecordType>;

export type TPanelContentType = keyof typeof PANEL_RECORD_TYPES;

const isPanelContentType = (contentType: string): contentType is TPanelContentType =>
  Object.hasOwn(PANEL_RECORD_TYPES, contentType);

/** How the panel shows records of `contentType`, or undefined for one it can't show. */
export const panelRecordType = (contentType: string): IPanelRecordType | undefined =>
  isPanelContentType(contentType) ? PANEL_RECORD_TYPES[contentType] : undefined;

/** A saved record's own page, where the panel's expand button leads. */
export const recordPagePath = ({ contentType, contentId }: TRelationEntity, pathname: string) => {
  const type = panelRecordType(contentType);

  if (!type || contentId === NEW_RECORD_ID) return null;

  return `${type.listPath(pathname)}/${encodeURIComponent(contentId)}`;
};
