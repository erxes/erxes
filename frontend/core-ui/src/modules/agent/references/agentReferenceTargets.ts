import {
  IconAffiliate,
  IconArrowUpRight,
  IconBriefcase,
  IconBuilding,
  IconChessKnight,
  IconHierarchy,
  IconInbox,
  IconShoppingCart,
  IconUser,
  type Icon,
} from '@tabler/icons-react';

import { type TAgentReferenceType } from './parseAgentReferences';

/**
 * Where a record reference points: the record page path, its icon, the
 * i18n label key, the plugin that must be loaded for the target to exist,
 * and the permission module the user needs to open it.
 *
 * Paths mirror `CORE_RESULT_PATHS` in
 * `modules/search/providers/coreSearchProviders.ts`; they are kept local
 * (not imported) because that map is keyed by search node module names,
 * not reference types, and the agent registry also carries plugin
 * availability and permission metadata the search map does not have.
 */
export interface IAgentReferenceTarget {
  type: TAgentReferenceType;
  icon: Icon;
  /** Label under the `common:agent.reference-types` i18n group. */
  labelKey: string;
  /**
   * Target module in `usePermissionCheck().hasModulePermission`. Empty for
   * `page`: its navigability comes from the client catalog instead.
   */
  permissionModule?: string;
  /**
   * Module Federation remote that must be loaded for the record page to
   * exist. Core pages need none; `sales`/`frontline` come from plugins.
   */
  pluginRemote?: 'sales_ui' | 'frontline_ui';
  path: (
    id: string,
    location?: { boardId: string; pipelineId: string },
  ) => string | null;
}

export const AGENT_REFERENCE_TARGETS: Record<
  TAgentReferenceType,
  IAgentReferenceTarget
> = {
  customer: {
    type: 'customer',
    icon: IconUser,
    labelKey: 'customer',
    permissionModule: 'contacts',
    path: (id) => `/contacts/customers?contactId=${id}`,
  },
  company: {
    type: 'company',
    icon: IconBuilding,
    labelKey: 'company',
    permissionModule: 'contacts',
    path: (id) => `/contacts/companies?companyId=${id}`,
  },
  user: {
    type: 'user',
    icon: IconUser,
    labelKey: 'user',
    permissionModule: 'teamMembers',
    path: (id) => `/settings/team/members?user_id=${id}`,
  },
  product: {
    type: 'product',
    icon: IconShoppingCart,
    labelKey: 'product',
    permissionModule: 'products',
    path: (id) => `/settings/products?product_id=${id}`,
  },
  structureEntity: {
    type: 'structureEntity',
    icon: IconHierarchy,
    labelKey: 'structureEntity',
    permissionModule: 'organization',
    path: (id) => `/settings/structures?entity_id=${id}`,
  },
  brand: {
    type: 'brand',
    icon: IconChessKnight,
    labelKey: 'brand',
    permissionModule: 'brands',
    path: (id) => `/settings/brands?brand_id=${id}`,
  },
  deal: {
    type: 'deal',
    icon: IconBriefcase,
    labelKey: 'deal',
    permissionModule: 'deal',
    pluginRemote: 'sales_ui',
    path: (id, location) =>
      location
        ? `/sales/deals?${new URLSearchParams({
            boardId: location.boardId,
            pipelineId: location.pipelineId,
            salesItemId: id,
          }).toString()}`
        : null,
  },
  conversation: {
    type: 'conversation',
    icon: IconInbox,
    labelKey: 'conversation',
    permissionModule: 'inbox',
    pluginRemote: 'frontline_ui',
    path: (id) => `/frontline/inbox?conversationId=${id}`,
  },
  automation: {
    type: 'automation',
    icon: IconAffiliate,
    labelKey: 'automation',
    permissionModule: 'automations',
    path: (id) => `/automations/edit/${id}`,
  },
  page: {
    type: 'page',
    icon: IconArrowUpRight,
    labelKey: 'page',
    /**
     * `path(id)` is never used — the chip decodes the base64url token id
     * itself and navigates only when the decoded path is a known catalog
     * page (never an invented one).
     */
    path: () => null,
  },
};

export { decodeAgentPagePath } from './referencePagePath';

/** Resolves whether a reference target is navigable for the current user. */
export const getAgentReferenceTarget = (type: TAgentReferenceType) =>
  AGENT_REFERENCE_TARGETS[type];
