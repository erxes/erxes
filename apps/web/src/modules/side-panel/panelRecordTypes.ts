import { type ComponentType, useCallback } from 'react';
import { getContactListPath } from '~/modules/contacts/utils/contactDetailPath';
import { findPluginRecordType, usePluginRecordType } from '~/modules/plugins/usePluginRecordType';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { paths } from '~/lib/paths';
import { lazyPanelView } from './lazyPanelView';
import type { IRecordViewProps } from './recordView';
import { NEW_RECORD_ID, type TRelationEntity } from './sidePanelPaths';

// Each loads the first time a record of its type opens, so the shell carries none of them.
const SidePanelSavedRecord = lazyPanelView(
  async () => (await import('./SidePanelSavedRecord')).SidePanelSavedRecord,
);

const CustomerPanelNew = lazyPanelView(
  async () => (await import('./details/CustomerPanelNew')).CustomerPanelNew,
);

const CompanyPanelNew = lazyPanelView(
  async () => (await import('./details/CompanyPanelNew')).CompanyPanelNew,
);

const ProductPanel = lazyPanelView(
  async () => (await import('~/modules/products/panel/ProductPanel')).ProductPanel,
);

const ProductPanelNew = lazyPanelView(
  async () => (await import('~/modules/products/panel/ProductPanelNew')).ProductPanelNew,
);

const MemberDetail = lazyPanelView(
  async () => (await import('~/modules/settings/team-members/details/MemberDetail')).MemberDetail,
);

const PluginRecordView = lazyPanelView(
  async () => (await import('~/modules/plugins/PluginRecordView')).PluginRecordView,
);

const PluginRecordNew = lazyPanelView(
  async () => (await import('~/modules/plugins/PluginRecordView')).PluginRecordNew,
);

interface IPanelRecordType {
  /** What one is called, in English, for its draft's title: "New customer". */
  label: string;
  /** The plugin whose words `label` is (its i18n namespace); none: core's. */
  plugin?: string;
  /** A saved record: its header and tabs. */
  View: ComponentType<IRecordViewProps>;
  /** A record not created yet; once saved, the record takes its place. None: no drafts. */
  New?: ComponentType<{ contentType: string }>;
  /** The list a record's own page goes back to; `pathname` is the page open now. */
  listPath: (pathname: string) => string;
  /** A plugin record's own page; core's are `<listPath>/<id>`. */
  pagePath?: (contentId: string) => string;
}

/** Core's records the side panel shows. Each expands to its own page, `<listPath>/<id>` or `pagePath`. */
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
  // A team member: their detail, links and what they did. Invited, not drafted.
  'core:user': {
    label: 'Team member',
    View: MemberDetail,
    listPath: () => paths.settings.teamMembers,
    pagePath: paths.settings.teamMember,
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

  return { type: entry && pluginPanelType(entry), loading: entry ? false : loading };
};

const pluginPanelType = (
  entry: NonNullable<ReturnType<typeof findPluginRecordType>>,
): IPanelRecordType => ({
  label: entry.type.title,
  plugin: entry.plugin,
  View: PluginRecordView,
  New: entry.type.New ? PluginRecordNew : undefined,
  // A plugin's own page goes back to the plugin's first page.
  listPath: () => entry.base,
  pagePath: entry.type.detailPath,
});

/** The own page of a record of any type, for going from one record's page to another's. */
export const useRecordPagePathOf = () => {
  const { plugins } = usePlugins();

  return useCallback(
    (record: TRelationEntity, pathname: string) => {
      const entry = findPluginRecordType(plugins, record.contentType);

      const type = isPanelContentType(record.contentType)
        ? PANEL_RECORD_TYPES[record.contentType]
        : entry && pluginPanelType(entry);

      return recordPagePath(type, record, pathname);
    },
    [plugins],
  );
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
